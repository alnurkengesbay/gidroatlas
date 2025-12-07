# Деплой GidroAtlas на Render

## Быстрый деплой (Blueprint)

1. Залей код на GitHub
2. Зайди на [render.com](https://render.com)
3. New → Blueprint → выбери репозиторий
4. Render автоматически найдёт `render.yaml` и создаст сервис

## Ручной деплой

### 1. Создай Web Service

1. Dashboard → New → Web Service
2. Подключи GitHub репозиторий
3. Настройки:

| Параметр | Значение |
|----------|----------|
| **Name** | gidroatlas |
| **Region** | Frankfurt (EU Central) |
| **Branch** | main |
| **Root Directory** | (пусто) |
| **Runtime** | Node |
| **Build Command** | `cd frontend && npm install && npm run build && cd ../backend && npm install` |
| **Start Command** | `cd backend && npm start` |
| **Plan** | Free |

### 2. Environment Variables

Добавь в настройках сервиса:

```
NODE_ENV=production
JWT_SECRET=<сгенерируй случайную строку>
RAPIDAPI_KEY=<твой ключ от RapidAPI для GPT-4o-mini>
```

### 3. Deploy

Нажми "Create Web Service" — деплой начнётся автоматически.

## После деплоя

- URL будет вида: `https://gidroatlas.onrender.com`
- Первый запуск на Free плане занимает ~2-3 минуты
- После 15 минут неактивности сервис "засыпает" (cold start ~30 сек)

## Локальная проверка production build

```bash
# Сборка фронтенда
cd frontend && npm run build

# Запуск бэкенда в production режиме
cd ../backend
NODE_ENV=production npm start
```

Открой http://localhost:3001

## Troubleshooting

### better-sqlite3 не компилируется
Render поддерживает native modules, но если проблемы — используй Node 18.x в engines.

### База пустая после деплоя
`postinstall` скрипт в backend/package.json автоматически запускает seed.js

