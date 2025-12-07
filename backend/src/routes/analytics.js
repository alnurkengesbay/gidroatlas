const express = require('express');
const axios = require('axios');
const { db } = require('../database');

const router = express.Router();

// RapidAPI GPT-4o-mini configuration
const AI_API_URL = 'https://gpt-4o-mini.p.rapidapi.com/chat/completions';
const AI_API_KEY = process.env.RAPIDAPI_KEY || '9a0f172768mshc46725afc0019dfp172bddjsn73455f16dc83';

// Calculate priority score
function calculatePriority(technicalCondition, passportDate) {
  const now = new Date();
  const passport = new Date(passportDate);
  const ageInYears = (now - passport) / (1000 * 60 * 60 * 24 * 365);
  const score = (6 - technicalCondition) * 3 + ageInYears;
  
  let level;
  if (score >= 12) level = 'high';
  else if (score >= 6) level = 'medium';
  else level = 'low';
  
  return { score: Math.round(score * 100) / 100, level };
}

// Get all objects data for AI context
function getObjectsContext() {
  const objects = db.prepare('SELECT * FROM water_objects').all();
  const stats = {
    total: objects.length,
    critical: objects.filter(o => o.technical_condition >= 4).length,
    good: objects.filter(o => o.technical_condition <= 2).length,
    byRegion: {},
    byType: {}
  };
  
  objects.forEach(obj => {
    stats.byRegion[obj.region] = (stats.byRegion[obj.region] || 0) + 1;
    stats.byType[obj.resource_type] = (stats.byType[obj.resource_type] || 0) + 1;
  });
  
  return { objects, stats };
}

// AI Assistant - Real GPT integration
router.post('/assistant', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Get database context
    const { objects, stats } = getObjectsContext();
    
    // Build context for AI
    const criticalObjects = objects
      .filter(o => o.technical_condition >= 4)
      .map(o => `${o.name} (состояние: ${o.technical_condition}, регион: ${o.region})`);
    
    const topPriority = objects
      .map(o => ({ ...o, priority: calculatePriority(o.technical_condition, o.passport_date) }))
      .sort((a, b) => b.priority.score - a.priority.score)
      .slice(0, 5)
      .map(o => `${o.name} (приоритет: ${o.priority.score}, состояние: ${o.technical_condition})`);

    const systemPrompt = `Ты - ГидроКонсультант, AI-ассистент платформы GidroAtlas для мониторинга водных ресурсов Казахстана.

ДАННЫЕ В БАЗЕ:
- Всего объектов: ${stats.total}
- Критических (состояние 4-5): ${stats.critical}
- В хорошем состоянии (1-2): ${stats.good}

КРИТИЧЕСКИЕ ОБЪЕКТЫ:
${criticalObjects.join('\n')}

ТОП-5 ПО ПРИОРИТЕТУ ОБСЛЕДОВАНИЯ:
${topPriority.join('\n')}

РЕГИОНЫ: ${Object.entries(stats.byRegion).map(([k,v]) => `${k}: ${v}`).join(', ')}

ТИПЫ ОБЪЕКТОВ: ${Object.entries(stats.byType).map(([k,v]) => `${k}: ${v}`).join(', ')}

ФОРМУЛА ПРИОРИТЕТА: (6 - состояние) × 3 + возраст_паспорта_в_годах
- ≥12 баллов = Высокий приоритет
- 6-11 = Средний
- <6 = Низкий

Отвечай кратко, по делу, на русском языке. Используй эмодзи для наглядности. Если спрашивают про конкретный регион или объект - давай конкретные данные.`;

    // Call GPT API
    const aiResponse = await axios.post(AI_API_URL, {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'gpt-4o-mini.p.rapidapi.com',
        'x-rapidapi-key': AI_API_KEY
      }
    });

    const aiMessage = aiResponse.data.choices[0]?.message?.content || 'Не удалось получить ответ';

    // Check if we should return objects data
    let responseData = null;
    let responseType = 'text';
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('критич') || lowerQuery.includes('опасн')) {
      responseType = 'objects';
      responseData = objects
        .filter(o => o.technical_condition >= 4)
        .map(o => ({ ...o, priority: calculatePriority(o.technical_condition, o.passport_date) }));
    } else if (lowerQuery.includes('приоритет') || lowerQuery.includes('первым') || lowerQuery.includes('обследов')) {
      responseType = 'priority_list';
      responseData = objects
        .map(o => ({ ...o, priority: calculatePriority(o.technical_condition, o.passport_date) }))
        .sort((a, b) => b.priority.score - a.priority.score)
        .slice(0, 10);
    } else if (lowerQuery.includes('маршрут')) {
      responseType = 'route';
      responseData = objects
        .filter(o => o.technical_condition >= 3)
        .map(o => ({ ...o, priority: calculatePriority(o.technical_condition, o.passport_date) }))
        .sort((a, b) => b.priority.score - a.priority.score)
        .slice(0, 10);
    } else if (lowerQuery.includes('област')) {
      // Find region in query
      const regions = [...new Set(objects.map(o => o.region))];
      const foundRegion = regions.find(r => lowerQuery.includes(r.toLowerCase().split(' ')[0].toLowerCase()));
      if (foundRegion) {
        responseType = 'objects';
        responseData = objects
          .filter(o => o.region === foundRegion)
          .map(o => ({ ...o, priority: calculatePriority(o.technical_condition, o.passport_date) }));
      }
    }

    res.json({
      type: responseType,
      message: aiMessage,
      data: responseData
    });

  } catch (error) {
    console.error('AI Assistant error:', error.response?.data || error.message);
    
    // Fallback to simple response
    res.json({
      type: 'text',
      message: '⚠️ AI временно недоступен. Попробуйте позже или используйте фильтры на карте.',
      data: null
    });
  }
});

// Optimal inspection route (TSP-like)
router.get('/route', (req, res) => {
  try {
    const { region, max_objects = 10 } = req.query;
    
    let query = `
      SELECT * FROM water_objects 
      WHERE technical_condition >= 3
    `;
    const params = [];
    
    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }
    
    query += ' ORDER BY technical_condition DESC LIMIT ?';
    params.push(parseInt(max_objects));
    
    const objects = db.prepare(query).all(...params);
    
    if (objects.length === 0) {
      return res.json({ route: [], totalDistance: 0, message: 'Нет объектов для маршрута' });
    }

    // Simple nearest neighbor algorithm for route optimization
    const route = [];
    const remaining = [...objects];
    let current = remaining.shift();
    route.push(current);

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      remaining.forEach((obj, idx) => {
        const dist = Math.sqrt(
          Math.pow(obj.latitude - current.latitude, 2) +
          Math.pow(obj.longitude - current.longitude, 2)
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });

      current = remaining.splice(nearestIdx, 1)[0];
      route.push(current);
    }

    // Calculate total approximate distance
    let totalDistance = 0;
    for (let i = 1; i < route.length; i++) {
      const dist = Math.sqrt(
        Math.pow(route[i].latitude - route[i-1].latitude, 2) +
        Math.pow(route[i].longitude - route[i-1].longitude, 2)
      ) * 111;
      totalDistance += dist;
    }

    res.json({
      route: route.map((obj, idx) => ({
        ...obj,
        order: idx + 1,
        priority: calculatePriority(obj.technical_condition, obj.passport_date)
      })),
      totalDistance: Math.round(totalDistance),
      estimatedTime: Math.round(totalDistance / 60)
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Ошибка построения маршрута' });
  }
});

// Heatmap data for risk zones
router.get('/heatmap', (req, res) => {
  try {
    const objects = db.prepare(`
      SELECT latitude, longitude, technical_condition 
      FROM water_objects
    `).all();

    const heatmapData = objects.map(obj => ({
      lat: obj.latitude,
      lng: obj.longitude,
      intensity: obj.technical_condition / 5
    }));

    res.json(heatmapData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения данных тепловой карты' });
  }
});

// Priority table with full calculations
router.get('/priority-table', (req, res) => {
  try {
    const { sort_by = 'priority', sort_order = 'desc', limit = 100 } = req.query;
    
    const objects = db.prepare('SELECT * FROM water_objects').all();
    
    const enriched = objects.map(obj => {
      const priority = calculatePriority(obj.technical_condition, obj.passport_date);
      return { ...obj, priority };
    });

    enriched.sort((a, b) => {
      let aVal, bVal;
      
      switch(sort_by) {
        case 'priority':
          aVal = a.priority.score;
          bVal = b.priority.score;
          break;
        case 'condition':
          aVal = a.technical_condition;
          bVal = b.technical_condition;
          break;
        case 'passport_date':
          aVal = new Date(a.passport_date).getTime();
          bVal = new Date(b.passport_date).getTime();
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }
      
      if (sort_order === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    res.json({
      data: enriched.slice(0, parseInt(limit)),
      total: objects.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения таблицы приоритетов' });
  }
});

module.exports = router;
