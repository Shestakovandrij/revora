# REVORA MOVE

UK-маркетплейс пошуку, порівняння та бронювання перевізників (Next.js + TypeScript +
Prisma). Повний опис продукту — у [CLAUDE.md](CLAUDE.md), архітектура — у
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Запуск локально

```bash
npm install
npx prisma generate
npx prisma migrate dev        # створює локальну SQLite-базу
npm run db:seed               # демо-перевізники, напрямки, послуги, відгуки
npm run dev                   # http://localhost:3000
```

> ⚠️ Не запускайте `npm run dev` одразу після `npm run build` у тій самій теці —
> спільний `.next` ламає dev-манифест. Якщо dev почав віддавати 500/повільно —
> `rm -rf .next` і перезапустіть `npm run dev`.

### Демо-логіни (пароль: `password123`)

| Роль | Email |
|---|---|
| Administrator | `admin@revora.test` |
| Carrier | `james-carter@revora.test` |
| Customer | `customer@revora.test` |

## Скрипти

- `npm run dev` — режим розробки
- `npm run build` / `npm start` — production
- `npm run db:seed` — засідати демо-дані
- `npm run db:reset` — скинути БД і засідати наново

## Середовище (`.env`)

- `DATABASE_URL` — локально `file:./dev.db` (SQLite)
- `AUTH_SECRET` — секрет підпису сесій (згенерувати новий для проду)
- `ORS_API_KEY` — OpenRouteService (необов'язково; без нього — офлайн-оцінка відстані)

## Деплой на Hostinger (MySQL)

1. У `prisma/schema.prisma` змінити `provider = "sqlite"` → `provider = "mysql"`.
2. `DATABASE_URL` → рядок підключення до Hostinger MySQL.
3. `npx prisma migrate deploy` на сервері; автодеплой із GitHub (Node 22).
