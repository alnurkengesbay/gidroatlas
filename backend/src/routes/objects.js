const express = require('express');
const { db } = require('../database');
const { authMiddleware, expertOnly } = require('../middleware/auth');

const router = express.Router();

// Calculate priority score
function calculatePriority(technicalCondition, passportDate) {
  const now = new Date();
  const passport = new Date(passportDate);
  const ageInYears = (now - passport) / (1000 * 60 * 60 * 24 * 365);
  
  // PriorityScore = состояние * 3 + возраст паспорта в годах
  // Чем хуже состояние (5) и старше паспорт - тем выше приоритет
  const score = technicalCondition * 3 + ageInYears;
  
  let level;
  if (score >= 15) level = 'high';      // состояние 4+ или 3 с 6+ лет
  else if (score >= 9) level = 'medium'; // состояние 2-3 со старым паспортом
  else level = 'low';                    // хорошее состояние, свежий паспорт
  
  return { score: Math.round(score * 100) / 100, level };
}

// Коэффициенты деградации по типу объекта (лет до ухудшения на 1 категорию)
const DEGRADATION_RATES = {
  'плотина': 0.25,        // бетон деградирует медленно
  'шлюз': 0.6,            // механика изнашивается быстрее
  'гидроузел': 0.5,       // комплексные сооружения
  'канал': 0.4,           // земляные работы, эрозия
  'водохранилище': 0.2,   // большие объёмы стабильнее
  'озеро': 0.15           // природные объекты
};

// Коэффициенты агрессивности среды
const WATER_TYPE_FACTOR = {
  'непресная': 1.3,       // солёная вода более агрессивная
  'пресная': 1.0,
  'нет': 0.8              // нет воды = меньше коррозии
};

// Факторная модель прогнозирования
function predictCriticalDate(object) {
  const { technical_condition, passport_date, resource_type, water_type, fauna } = object;
  
  // Уже критическое
  if (technical_condition >= 4) {
    return { 
      critical: true, 
      message: 'Требует немедленного внимания',
      confidence: 'высокая',
      factors: ['Текущее состояние уже критическое']
    };
  }
  
  // Базовая скорость деградации по типу объекта
  const baseDegradation = DEGRADATION_RATES[resource_type] || 0.4;
  
  // Модификатор агрессивности среды
  const waterFactor = WATER_TYPE_FACTOR[water_type] || 1.0;
  
  // Модификатор экосистемной нагрузки (фауна = доп. органика, биообрастание)
  const faunaFactor = fauna ? 1.15 : 1.0;
  
  // Возраст паспорта влияет на неопределённость
  const now = new Date();
  const passport = new Date(passport_date);
  const passportAgeYears = (now - passport) / (1000 * 60 * 60 * 24 * 365);
  
  // Итоговая скорость деградации
  const effectiveDegradation = baseDegradation * waterFactor * faunaFactor;
  
  // Сколько категорий до критического (4)
  const categoriesToCritical = 4 - technical_condition;
  
  // Время до критического состояния
  const yearsToCondition4 = categoriesToCritical / effectiveDegradation;
  const monthsRemaining = Math.round(yearsToCondition4 * 12);
  
  // Уверенность прогноза (чем старее паспорт, тем ниже уверенность)
  let confidence;
  let confidencePercent;
  if (passportAgeYears < 1) {
    confidence = 'высокая';
    confidencePercent = 90;
  } else if (passportAgeYears < 3) {
    confidence = 'средняя';
    confidencePercent = 70;
  } else {
    confidence = 'низкая';
    confidencePercent = Math.max(30, 70 - passportAgeYears * 10);
  }
  
  // Факторы риска
  const factors = [];
  if (waterFactor > 1) factors.push('Агрессивная среда (непресная вода)');
  if (faunaFactor > 1) factors.push('Экосистемная нагрузка (наличие фауны)');
  if (baseDegradation >= 0.5) factors.push(`Тип объекта (${resource_type}) склонен к износу`);
  if (passportAgeYears > 2) factors.push(`Устаревшие данные (паспорт ${Math.round(passportAgeYears)} лет назад)`);
  
  const predictedDate = new Date();
  predictedDate.setMonth(predictedDate.getMonth() + monthsRemaining);
  
  return {
    critical: false,
    predictedCriticalDate: predictedDate.toISOString().split('T')[0],
    monthsRemaining,
    confidence,
    confidencePercent,
    factors,
    model: {
      baseDegradation: Math.round(baseDegradation * 100) / 100,
      waterFactor: Math.round(waterFactor * 100) / 100,
      faunaFactor: Math.round(faunaFactor * 100) / 100,
      effectiveDegradation: Math.round(effectiveDegradation * 100) / 100
    }
  };
}

// Get all objects with filtering, sorting, pagination
router.get('/', (req, res) => {
  try {
    const {
      region,
      resource_type,
      water_type,
      fauna,
      condition_min,
      condition_max,
      passport_from,
      passport_to,
      priority_level,
      search,
      sort_by = 'name',
      sort_order = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    let query = 'SELECT * FROM water_objects WHERE 1=1';
    const params = [];

    // Filters
    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }
    if (resource_type) {
      query += ' AND resource_type = ?';
      params.push(resource_type);
    }
    if (water_type) {
      query += ' AND water_type = ?';
      params.push(water_type);
    }
    if (fauna !== undefined) {
      query += ' AND fauna = ?';
      params.push(fauna === 'true' || fauna === '1' ? 1 : 0);
    }
    if (condition_min) {
      query += ' AND technical_condition >= ?';
      params.push(parseInt(condition_min));
    }
    if (condition_max) {
      query += ' AND technical_condition <= ?';
      params.push(parseInt(condition_max));
    }
    if (passport_from) {
      query += ' AND passport_date >= ?';
      params.push(passport_from);
    }
    if (passport_to) {
      query += ' AND passport_date <= ?';
      params.push(passport_to);
    }
    if (search) {
      query += ' AND (name LIKE ? OR region LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Sorting
    const validSortFields = ['name', 'region', 'resource_type', 'technical_condition', 'passport_date'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'name';
    const sortDir = sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortDir}`;

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const totalCount = db.prepare(countQuery.split('ORDER BY')[0]).get(...params).count;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const objects = db.prepare(query).all(...params);

    // Add priority and prediction to each object
    const enrichedObjects = objects.map(obj => {
      const priority = calculatePriority(obj.technical_condition, obj.passport_date);
      const prediction = predictCriticalDate(obj);
      return {
        ...obj,
        priority,
        prediction
      };
    });

    // Filter by priority level if specified
    let filteredObjects = enrichedObjects;
    if (priority_level) {
      filteredObjects = enrichedObjects.filter(obj => obj.priority.level === priority_level);
    }

    res.json({
      data: filteredObjects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching objects:', error);
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// Get single object by ID
router.get('/:id', (req, res) => {
  try {
    const obj = db.prepare('SELECT * FROM water_objects WHERE id = ?').get(req.params.id);
    
    if (!obj) {
      return res.status(404).json({ error: 'Объект не найден' });
    }

    const priority = calculatePriority(obj.technical_condition, obj.passport_date);
    const prediction = predictCriticalDate(obj);

    res.json({
      ...obj,
      priority,
      prediction
    });
  } catch (error) {
    console.error('Error fetching object:', error);
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// Get all regions
router.get('/meta/regions', (req, res) => {
  try {
    const regions = db.prepare('SELECT DISTINCT region FROM water_objects ORDER BY region').all();
    res.json(regions.map(r => r.region));
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения регионов' });
  }
});

// Get statistics
router.get('/meta/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM water_objects').get().count;
    const byCondition = db.prepare(`
      SELECT technical_condition, COUNT(*) as count 
      FROM water_objects 
      GROUP BY technical_condition 
      ORDER BY technical_condition
    `).all();
    const byRegion = db.prepare(`
      SELECT region, COUNT(*) as count 
      FROM water_objects 
      GROUP BY region 
      ORDER BY count DESC
    `).all();
    const byType = db.prepare(`
      SELECT resource_type, COUNT(*) as count 
      FROM water_objects 
      GROUP BY resource_type 
      ORDER BY count DESC
    `).all();
    
    const critical = db.prepare('SELECT COUNT(*) as count FROM water_objects WHERE technical_condition >= 4').get().count;

    res.json({
      total,
      critical,
      byCondition,
      byRegion,
      byType
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

module.exports = router;

