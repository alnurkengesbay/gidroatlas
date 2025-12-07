const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { db } = require('../database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Поддерживаются только CSV, Excel и JSON файлы'));
    }
  }
});

// RapidAPI GPT configuration
const AI_API_URL = 'https://gpt-4o-mini.p.rapidapi.com/chat/completions';
const AI_API_KEY = process.env.RAPIDAPI_KEY || '9a0f172768mshc46725afc0019dfp172bddjsn73455f16dc83';

// Standardize data using AI
async function standardizeWithAI(rawData) {
  const prompt = `Ты — система стандартизации данных о водных объектах Казахстана.

Преобразуй следующие сырые данные в стандартный формат JSON.

ПРАВИЛА:
1. resource_type должен быть одним из: озеро, канал, водохранилище, шлюз, гидроузел, плотина
2. water_type должен быть: пресная, непресная, или null если неизвестно
3. technical_condition — число от 1 до 5:
   - 1 = отличное/новое
   - 2 = хорошее
   - 3 = удовлетворительное
   - 4 = неудовлетворительное/требует ремонта
   - 5 = аварийное/критическое
4. fauna — true/false
5. passport_date — формат YYYY-MM-DD
6. latitude/longitude — координаты в Казахстане (широта 40-56, долгота 46-88)
7. region — полное название области (например: "Алматинская область")

ВХОДНЫЕ ДАННЫЕ:
${JSON.stringify(rawData, null, 2)}

Верни ТОЛЬКО валидный JSON массив объектов в формате:
[{
  "name": "string",
  "region": "string область",
  "resource_type": "озеро|канал|водохранилище|шлюз|гидроузел|плотина",
  "water_type": "пресная|непресная|null",
  "fauna": true|false,
  "fauna_description": "string или null",
  "passport_date": "YYYY-MM-DD",
  "technical_condition": 1-5,
  "latitude": number,
  "longitude": number,
  "description": "string или null"
}]

Если данных недостаточно для поля — используй разумные значения по умолчанию для Казахстана.
Если координаты не указаны — сгенерируй примерные для указанного региона.`;

  try {
    const response = await axios.post(AI_API_URL, {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Ты система стандартизации данных. Отвечай ТОЛЬКО валидным JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'gpt-4o-mini.p.rapidapi.com',
        'x-rapidapi-key': AI_API_KEY
      }
    });

    const content = response.data.choices[0]?.message?.content || '[]';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('AI standardization error:', error.message);
    throw new Error('Ошибка AI стандартизации');
  }
}

// Parse uploaded file
function parseFile(filePath, ext) {
  if (ext === '.json') {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }
  
  if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }
  
  throw new Error('Неподдерживаемый формат файла');
}

// Save standardized objects to database
function saveObjects(objects) {
  const insert = db.prepare(`
    INSERT INTO water_objects (
      name, region, resource_type, water_type, fauna, fauna_description,
      passport_date, technical_condition, latitude, longitude, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const results = { success: 0, errors: [] };

  for (const obj of objects) {
    try {
      // Validate required fields
      if (!obj.name || !obj.region || !obj.resource_type || !obj.technical_condition) {
        results.errors.push({ name: obj.name, error: 'Отсутствуют обязательные поля' });
        continue;
      }

      // Validate technical_condition
      const condition = parseInt(obj.technical_condition);
      if (condition < 1 || condition > 5) {
        results.errors.push({ name: obj.name, error: 'Некорректное состояние (должно быть 1-5)' });
        continue;
      }

      insert.run(
        obj.name,
        obj.region,
        obj.resource_type,
        obj.water_type || null,
        obj.fauna ? 1 : 0,
        obj.fauna_description || null,
        obj.passport_date || new Date().toISOString().split('T')[0],
        condition,
        obj.latitude || 48.0,
        obj.longitude || 68.0,
        obj.description || null
      );
      
      results.success++;
    } catch (error) {
      results.errors.push({ name: obj.name, error: error.message });
    }
  }

  return results;
}

// Upload and process file
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    // 1. Parse file
    console.log('📄 Parsing file:', req.file.originalname);
    const rawData = parseFile(filePath, ext);
    
    if (!Array.isArray(rawData) || rawData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Файл пуст или имеет неверный формат' });
    }

    console.log(`📊 Found ${rawData.length} records`);

    // 2. Standardize with AI (process in batches of 10)
    const batchSize = 10;
    const allStandardized = [];
    
    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, i + batchSize);
      console.log(`🤖 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(rawData.length/batchSize)}`);
      
      try {
        const standardized = await standardizeWithAI(batch);
        allStandardized.push(...standardized);
      } catch (error) {
        console.error(`Batch error:`, error.message);
      }
    }

    console.log(`✅ Standardized ${allStandardized.length} records`);

    // 3. Save to database
    const saveResults = saveObjects(allStandardized);

    // 4. Cleanup
    fs.unlinkSync(filePath);

    // 5. Return results
    res.json({
      message: 'Файл обработан',
      original_count: rawData.length,
      standardized_count: allStandardized.length,
      saved_count: saveResults.success,
      errors: saveResults.errors,
      sample: allStandardized.slice(0, 3)
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Ошибка обработки файла' });
  }
});

// Get upload status/stats
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM water_objects').get();
    const byType = db.prepare(`
      SELECT resource_type, COUNT(*) as count 
      FROM water_objects 
      GROUP BY resource_type
    `).all();
    
    res.json({
      total: total.count,
      byType
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

module.exports = router;

