const { db, initDatabase } = require('./database');

// Инициализация базы данных
initDatabase();

// Реальные данные водных объектов Казахстана
const waterObjects = [
  // Гидротехнические сооружения (из документа)
  {
    name: "Бухтарминский судоходный шлюз",
    region: "Восточно-Казахстанская область",
    resource_type: "шлюз",
    water_type: "нет",
    fauna: false,
    passport_date: "2022-05-01",
    technical_condition: 3,
    latitude: 49.15,
    longitude: 84.05,
    description: "Судоходный шлюз на Бухтарминском водохранилище"
  },
  {
    name: "Шульбинский судоходный шлюз",
    region: "Восточно-Казахстанская область",
    resource_type: "шлюз",
    water_type: "нет",
    fauna: false,
    passport_date: "2022-08-03",
    technical_condition: 5,
    latitude: 50.53,
    longitude: 81.05,
    description: "Критическое состояние, требует срочного обследования"
  },
  {
    name: "Чаглинский гидроузел",
    region: "Северо-Казахстанская область",
    resource_type: "гидроузел",
    water_type: "нет",
    fauna: false,
    passport_date: "2020-08-03",
    technical_condition: 1,
    latitude: 54.75,
    longitude: 69.20,
    description: "Отличное техническое состояние"
  },
  
  // Крупные водохранилища
  {
    name: "Капшагайское водохранилище",
    region: "Алматинская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Судак, сазан, жерех, сом",
    passport_date: "2021-06-15",
    technical_condition: 2,
    latitude: 43.88,
    longitude: 77.52,
    description: "Крупнейшее водохранилище на реке Или"
  },
  {
    name: "Бухтарминское водохранилище",
    region: "Восточно-Казахстанская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Судак, лещ, окунь, плотва",
    passport_date: "2020-04-20",
    technical_condition: 3,
    latitude: 49.17,
    longitude: 84.08,
    description: "Одно из крупнейших водохранилищ Казахстана"
  },
  {
    name: "Шардаринское водохранилище",
    region: "Туркестанская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Сазан, жерех, судак",
    passport_date: "2019-03-10",
    technical_condition: 4,
    latitude: 41.25,
    longitude: 67.97,
    description: "Требует обследования, устаревший паспорт"
  },
  
  // Озера
  {
    name: "Озеро Балхаш",
    region: "Алматинская область",
    resource_type: "озеро",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Сазан, судак, жерех, сом, маринка",
    passport_date: "2023-01-15",
    technical_condition: 2,
    latitude: 46.54,
    longitude: 74.88,
    description: "Крупнейшее озеро Казахстана, западная часть пресная"
  },
  {
    name: "Озеро Зайсан",
    region: "Восточно-Казахстанская область",
    resource_type: "озеро",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Окунь, щука, язь, линь",
    passport_date: "2022-09-20",
    technical_condition: 2,
    latitude: 48.00,
    longitude: 84.00,
    description: "Пресноводное озеро в Восточном Казахстане"
  },
  {
    name: "Озеро Алаколь",
    region: "Алматинская область",
    resource_type: "озеро",
    water_type: "непресная",
    fauna: true,
    fauna_description: "Маринка, окунь",
    passport_date: "2021-07-01",
    technical_condition: 3,
    latitude: 46.15,
    longitude: 81.72,
    description: "Соленое озеро, курортная зона"
  },
  {
    name: "Озеро Тенгиз",
    region: "Акмолинская область",
    resource_type: "озеро",
    water_type: "непресная",
    fauna: true,
    fauna_description: "Место гнездования фламинго",
    passport_date: "2020-05-15",
    technical_condition: 2,
    latitude: 50.42,
    longitude: 68.93,
    description: "Крупное соленое озеро, объект ЮНЕСКО"
  },
  
  // Каналы
  {
    name: "Канал Иртыш-Караганда",
    region: "Карагандинская область",
    resource_type: "канал",
    water_type: "пресная",
    fauna: false,
    passport_date: "2021-11-30",
    technical_condition: 3,
    latitude: 49.80,
    longitude: 73.10,
    description: "Магистральный канал водоснабжения"
  },
  {
    name: "Большой Алматинский канал",
    region: "Алматинская область",
    resource_type: "канал",
    water_type: "пресная",
    fauna: false,
    passport_date: "2022-02-28",
    technical_condition: 2,
    latitude: 43.25,
    longitude: 76.95,
    description: "Ирригационный канал Алматинской области"
  },
  {
    name: "Арысь-Туркестанский канал",
    region: "Туркестанская область",
    resource_type: "канал",
    water_type: "пресная",
    fauna: false,
    passport_date: "2019-08-15",
    technical_condition: 4,
    latitude: 43.30,
    longitude: 68.25,
    description: "Требует ремонта, старый паспорт"
  },
  
  // Плотины
  {
    name: "Капшагайская ГЭС (плотина)",
    region: "Алматинская область",
    resource_type: "плотина",
    water_type: "нет",
    fauna: false,
    passport_date: "2023-03-01",
    technical_condition: 2,
    latitude: 43.87,
    longitude: 77.08,
    description: "Плотина Капшагайской ГЭС"
  },
  {
    name: "Бухтарминская ГЭС (плотина)",
    region: "Восточно-Казахстанская область",
    resource_type: "плотина",
    water_type: "нет",
    fauna: false,
    passport_date: "2021-09-20",
    technical_condition: 3,
    latitude: 49.18,
    longitude: 84.02,
    description: "Плотина Бухтарминской ГЭС"
  },
  {
    name: "Шульбинская ГЭС (плотина)",
    region: "Восточно-Казахстанская область",
    resource_type: "плотина",
    water_type: "нет",
    fauna: false,
    passport_date: "2020-07-10",
    technical_condition: 4,
    latitude: 50.52,
    longitude: 81.03,
    description: "Требует обследования"
  },

  // Дополнительные объекты для полноты данных
  {
    name: "Озеро Маркаколь",
    region: "Восточно-Казахстанская область",
    resource_type: "озеро",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Ленок, хариус (эндемики)",
    passport_date: "2022-06-15",
    technical_condition: 1,
    latitude: 48.77,
    longitude: 85.73,
    description: "Заповедное озеро с эндемичной фауной"
  },
  {
    name: "Озеро Сасыкколь",
    region: "Алматинская область",
    resource_type: "озеро",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Сазан, карась, линь",
    passport_date: "2021-04-20",
    technical_condition: 3,
    latitude: 46.56,
    longitude: 81.03,
    description: "Пресноводное озеро Балхаш-Алакольской котловины"
  },
  {
    name: "Кызылагашское водохранилище",
    region: "Алматинская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: false,
    passport_date: "2018-11-01",
    technical_condition: 5,
    latitude: 45.12,
    longitude: 78.92,
    description: "КРИТИЧЕСКОЕ СОСТОЯНИЕ! Срочно требуется обследование"
  },
  {
    name: "Самаркандское водохранилище",
    region: "Восточно-Казахстанская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Карп, толстолобик",
    passport_date: "2022-03-15",
    technical_condition: 2,
    latitude: 50.08,
    longitude: 80.27,
    description: "Водохранилище для ирригации"
  },
  {
    name: "Коксарайский контррегулятор",
    region: "Туркестанская область",
    resource_type: "гидроузел",
    water_type: "нет",
    fauna: false,
    passport_date: "2023-02-01",
    technical_condition: 1,
    latitude: 42.97,
    longitude: 67.52,
    description: "Новый гидроузел, отличное состояние"
  },
  {
    name: "Вячеславское водохранилище",
    region: "Акмолинская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Карп, щука, окунь",
    passport_date: "2020-09-10",
    technical_condition: 3,
    latitude: 51.58,
    longitude: 71.23,
    description: "Водохранилище близ Астаны"
  },
  {
    name: "Сергеевское водохранилище",
    region: "Северо-Казахстанская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Судак, лещ, карась",
    passport_date: "2021-05-20",
    technical_condition: 2,
    latitude: 53.88,
    longitude: 67.42,
    description: "Крупное водохранилище Северного Казахстана"
  },
  {
    name: "Аксуский гидроузел",
    region: "Павлодарская область",
    resource_type: "гидроузел",
    water_type: "нет",
    fauna: false,
    passport_date: "2019-12-01",
    technical_condition: 4,
    latitude: 52.04,
    longitude: 76.93,
    description: "Требует обследования, устаревший паспорт"
  },
  {
    name: "Озеро Щучье",
    region: "Акмолинская область",
    resource_type: "озеро",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Щука, окунь, карась, рипус",
    passport_date: "2023-05-01",
    technical_condition: 1,
    latitude: 52.93,
    longitude: 70.21,
    description: "Курортное озеро Бурабая"
  },
  {
    name: "Озеро Боровое",
    region: "Акмолинская область",
    resource_type: "озеро",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Раки, карась",
    passport_date: "2023-05-15",
    technical_condition: 1,
    latitude: 53.08,
    longitude: 70.30,
    description: "Жемчужина Казахстана"
  },
  {
    name: "Чарынский каньон (река)",
    region: "Алматинская область",
    resource_type: "канал",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Маринка, осман",
    passport_date: "2022-08-20",
    technical_condition: 2,
    latitude: 43.35,
    longitude: 79.08,
    description: "Река Чарын, природный объект"
  },
  {
    name: "Талдыкорганский гидроузел",
    region: "Алматинская область",
    resource_type: "гидроузел",
    water_type: "нет",
    fauna: false,
    passport_date: "2020-03-15",
    technical_condition: 3,
    latitude: 45.02,
    longitude: 78.37,
    description: "Гидроузел на реке Каратал"
  },
  {
    name: "Мойнакская ГЭС (плотина)",
    region: "Алматинская область",
    resource_type: "плотина",
    water_type: "нет",
    fauna: false,
    passport_date: "2023-01-10",
    technical_condition: 1,
    latitude: 43.05,
    longitude: 78.37,
    description: "Новейшая ГЭС Казахстана"
  },
  {
    name: "Актогайское водохранилище",
    region: "Карагандинская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: false,
    passport_date: "2019-06-01",
    technical_condition: 4,
    latitude: 48.77,
    longitude: 72.53,
    description: "Требует технического обследования"
  },
  {
    name: "Жезказганское водохранилище",
    region: "Карагандинская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Карп, сазан",
    passport_date: "2021-07-20",
    technical_condition: 3,
    latitude: 47.78,
    longitude: 67.71,
    description: "Водохранилище промышленного водоснабжения"
  },
  {
    name: "Нуринский канал",
    region: "Карагандинская область",
    resource_type: "канал",
    water_type: "пресная",
    fauna: false,
    passport_date: "2020-10-15",
    technical_condition: 3,
    latitude: 49.95,
    longitude: 73.15,
    description: "Часть системы Иртыш-Караганда"
  },
  {
    name: "Озеро Шалкар",
    region: "Западно-Казахстанская область",
    resource_type: "озеро",
    water_type: "непресная",
    fauna: true,
    fauna_description: "Артемия (рачки)",
    passport_date: "2021-09-01",
    technical_condition: 2,
    latitude: 50.45,
    longitude: 54.50,
    description: "Соленое озеро, бальнеологический курорт"
  },
  {
    name: "Каратомарское водохранилище",
    region: "Костанайская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Карп, щука, окунь, судак",
    passport_date: "2022-04-10",
    technical_condition: 2,
    latitude: 52.47,
    longitude: 62.08,
    description: "Крупнейшее водохранилище Костанайской области"
  },
  {
    name: "Верхнетобольский гидроузел",
    region: "Костанайская область",
    resource_type: "гидроузел",
    water_type: "нет",
    fauna: false,
    passport_date: "2019-11-20",
    technical_condition: 4,
    latitude: 52.73,
    longitude: 62.22,
    description: "Требует модернизации"
  },
  {
    name: "Озеро Индер",
    region: "Атырауская область",
    resource_type: "озеро",
    water_type: "непресная",
    fauna: false,
    passport_date: "2020-06-15",
    technical_condition: 2,
    latitude: 48.58,
    longitude: 51.93,
    description: "Соленое озеро, добыча соли"
  },
  {
    name: "Кировское водохранилище",
    region: "Акмолинская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Сазан, карась",
    passport_date: "2018-09-01",
    technical_condition: 5,
    latitude: 51.43,
    longitude: 68.85,
    description: "КРИТИЧЕСКОЕ! Старый паспорт, требует немедленного обследования"
  },
  {
    name: "Селетинское водохранилище",
    region: "Акмолинская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Карп, карась, щука",
    passport_date: "2021-12-01",
    technical_condition: 2,
    latitude: 51.88,
    longitude: 68.47,
    description: "Водоснабжение Астаны"
  },
  {
    name: "Озеро Караколь",
    region: "Костанайская область",
    resource_type: "озеро",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Карась, линь, щука",
    passport_date: "2022-07-10",
    technical_condition: 2,
    latitude: 52.03,
    longitude: 63.93,
    description: "Пресноводное озеро"
  },
  {
    name: "Жанадарьинский гидроузел",
    region: "Кызылординская область",
    resource_type: "гидроузел",
    water_type: "нет",
    fauna: false,
    passport_date: "2020-04-01",
    technical_condition: 3,
    latitude: 44.83,
    longitude: 62.12,
    description: "Гидроузел на Сырдарье"
  },
  {
    name: "Озеро Камыстыбас",
    region: "Кызылординская область",
    resource_type: "озеро",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Сазан, сом, жерех",
    passport_date: "2019-10-15",
    technical_condition: 4,
    latitude: 45.73,
    longitude: 62.35,
    description: "Озеро в низовьях Сырдарьи, требует внимания"
  },
  {
    name: "Аральск-Сырдарьинский канал",
    region: "Кызылординская область",
    resource_type: "канал",
    water_type: "пресная",
    fauna: false,
    passport_date: "2021-08-20",
    technical_condition: 3,
    latitude: 46.12,
    longitude: 61.67,
    description: "Ирригационный канал"
  },
  {
    name: "Малое Аральское море",
    region: "Кызылординская область",
    resource_type: "озеро",
    water_type: "непресная",
    fauna: true,
    fauna_description: "Камбала, осётр (восстановление)",
    passport_date: "2023-04-01",
    technical_condition: 2,
    latitude: 46.78,
    longitude: 61.03,
    description: "Северная часть Аральского моря, проект восстановления"
  },
  {
    name: "Кокаральская плотина",
    region: "Кызылординская область",
    resource_type: "плотина",
    water_type: "нет",
    fauna: false,
    passport_date: "2022-11-01",
    technical_condition: 2,
    latitude: 46.57,
    longitude: 60.78,
    description: "Плотина для восстановления Малого Арала"
  },
  {
    name: "Токтогульское водохранилище (казахст. часть)",
    region: "Жамбылская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: false,
    passport_date: "2021-02-15",
    technical_condition: 3,
    latitude: 42.13,
    longitude: 73.38,
    description: "Трансграничное водохранилище"
  },
  {
    name: "Тасоткельское водохранилище",
    region: "Жамбылская область",
    resource_type: "водохранилище",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Сазан, толстолобик, белый амур",
    passport_date: "2020-08-01",
    technical_condition: 3,
    latitude: 43.18,
    longitude: 75.03,
    description: "Ирригационное водохранилище"
  },
  {
    name: "Озеро Биликоль",
    region: "Жамбылская область",
    resource_type: "озеро",
    water_type: "пресная",
    fauna: true,
    fauna_description: "Карась, сазан",
    passport_date: "2019-05-15",
    technical_condition: 4,
    latitude: 43.97,
    longitude: 73.48,
    description: "Мелеющее озеро, требует обследования"
  }
];

// Вставка данных
const insertStmt = db.prepare(`
  INSERT INTO water_objects (
    name, region, resource_type, water_type, fauna, fauna_description,
    passport_date, technical_condition, latitude, longitude, description
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Очистка существующих данных
db.exec('DELETE FROM water_objects');

// Вставка всех объектов
const insertMany = db.transaction((objects) => {
  for (const obj of objects) {
    insertStmt.run(
      obj.name,
      obj.region,
      obj.resource_type,
      obj.water_type || null,
      obj.fauna ? 1 : 0,
      obj.fauna_description || null,
      obj.passport_date,
      obj.technical_condition,
      obj.latitude,
      obj.longitude,
      obj.description || null
    );
  }
});

insertMany(waterObjects);

console.log(`✅ Загружено ${waterObjects.length} объектов водных ресурсов`);

// Статистика
const stats = db.prepare(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN technical_condition >= 4 THEN 1 ELSE 0 END) as critical,
    SUM(CASE WHEN technical_condition <= 2 THEN 1 ELSE 0 END) as good
  FROM water_objects
`).get();

console.log(`📊 Статистика:`);
console.log(`   Всего объектов: ${stats.total}`);
console.log(`   Критических (4-5): ${stats.critical}`);
console.log(`   Хороших (1-2): ${stats.good}`);

const byRegion = db.prepare(`
  SELECT region, COUNT(*) as count 
  FROM water_objects 
  GROUP BY region 
  ORDER BY count DESC
`).all();

console.log(`📍 По регионам:`);
byRegion.forEach(r => console.log(`   ${r.region}: ${r.count}`));

