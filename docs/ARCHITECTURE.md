# REVORA MOVE — Технічний план та архітектура

> Статус: **чернетка на затвердження**. Це план перед кодом. Коду ще немає.
> Після затвердження реалізуємо фазами (див. §7), кожну — з перевіркою.
> Джерело вимог — `CLAUDE.md` (бриф REVORA MOVE + PDF-ТЗ).

---

## 1. Принципи, зафіксовані наперед

- **Немає оплат на сайті.** Жодних `Payment`/deposit/commission/payout. Ціна — **орієнтовна оцінка**.
- **Немає самоактивації перевізників** — публікація лише після `APPROVED`.
- **Рейтинг/відгуки — лише від завершених замовлень**, з модерацією.
- **Cold start** — картки гарні при нулях; рейтинг nullable; ранжування не на рейтингу.
- **Мультимовність із дня 1** (EN контент, next-intl; готовність UK/PL/RO).
- **Документи не публічні** — лише статус; файли за авторизованим роутом.
- **Демо-контент відокремлений** прапорцем `isDemo`.

---

## 2. Модель даних (Prisma / MySQL)

Нижче — схема-ескіз. Типи під MySQL: гроші — `Decimal(10,2)`; довгі списки — `Json`;
enum — Prisma enum. Auth.js-таблиці (`Account`, `Session`, `VerificationToken`) опущено.

### 2.1 Користувачі та ролі

```prisma
enum Role { CUSTOMER CARRIER ADMIN MODERATOR }

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  passwordHash   String?
  role           Role     @default(CUSTOMER)
  name           String?
  phone          String?
  companyName    String?          // для клієнта «за потреби»
  locale         String   @default("en")
  emailVerifiedAt DateTime?
  createdAt      DateTime @default(now())

  carrier        Carrier?         // якщо role=CARRIER
  orders         Order[]  @relation("CustomerOrders")
  reviewsAuthored Review[]
}
```

Гість може бронювати без акаунта — контакти зберігаються в `Order`; `customerUserId` nullable.

### 2.2 Перевізник, авто, тарифи

```prisma
enum BusinessType { SOLE_TRADER LIMITED_COMPANY PARTNERSHIP OWNER_DRIVER REMOVAL_COMPANY COURIER_COMPANY }
enum VerificationStatus { PENDING APPROVED REJECTED MORE_INFO_REQUIRED SUSPENDED }

model Carrier {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id])

  // Профіль
  companyName      String?
  businessType     BusinessType
  companyRegNumber String?
  registeredAddress String?
  city             String
  experienceYears  Int      @default(0)
  description      String?  @db.Text
  languages        Json?          // ["English","Polish"]
  workingHours     Json?          // тижневий розклад за замовчуванням
  europeTransport  Boolean  @default(false)

  // Верифікація / публікація
  verificationStatus VerificationStatus @default(PENDING)
  isPublished        Boolean  @default(false)   // == APPROVED && !SUSPENDED
  isFeatured         Boolean  @default(false)   // ручний pin у «Top»
  isDemo             Boolean  @default(false)

  // Денормалізовані агрегати (перерахунок на подіях)
  avgRating        Float?           // null = ще немає відгуків (НЕ 0)
  reviewCount      Int      @default(0)
  completedJobs    Int      @default(0)
  cancelledJobs    Int      @default(0)
  completionRate   Float?
  avgResponseMinutes Int?

  // Обчислювані
  profileCompleteness Int   @default(0)   // 0..100
  rankingScore     Float    @default(0)

  joinedAt         DateTime @default(now())

  vehicles         Vehicle[]
  pricing          PricingProfile?
  documents        Document[]
  areas            CarrierArea[]
  services         CarrierService[]
  availability     Availability[]
  orders           Order[]
  reviews          Review[]
}
```

```prisma
enum VehicleType { CAR VAN_SMALL VAN_MEDIUM VAN_LARGE LUTON TRUCK_7_5T TRUCK OTHER }

model Vehicle {
  id             String  @id @default(cuid())
  carrierId      String
  carrier        Carrier @relation(fields: [carrierId], references: [id])
  vehicleType    VehicleType
  make           String
  model          String
  year           Int
  registrationNumber String        // зберігаємо, показуємо частково
  bodyType       String?
  loadCapacityKg Int?
  internalLengthCm Int?
  internalWidthCm  Int?
  internalHeightCm Int?
  volumeM3       Float?
  passengerSeats Int?    @default(0)
  tailLift       Boolean @default(false)
  equipment      Json?          // ремені, захисні матеріали, візки
  isActive       Boolean @default(true)   // тимчасово вимкнути
  photos         VehiclePhoto[]
}

model VehiclePhoto {
  id        String  @id @default(cuid())
  vehicleId String
  url       String
  type      String  // profile|front|back|side|interior|equipment|job
  sortOrder Int     @default(0)
}
```

```prisma
model PricingProfile {
  id             String  @id @default(cuid())
  carrierId      String  @unique
  currency       String  @default("GBP")

  baseRate       Decimal @db.Decimal(10,2) @default(0)
  perMileRate    Decimal @db.Decimal(10,2) @default(0)
  perHourRate    Decimal @db.Decimal(10,2) @default(0)
  minimumCharge  Decimal @db.Decimal(10,2) @default(0)

  // Доплати (null = не застосовується)
  helperRate         Decimal? @db.Decimal(10,2)   // за 1 помічника
  floorSurcharge     Decimal? @db.Decimal(10,2)   // за поверх без ліфта
  noLiftSurcharge    Decimal? @db.Decimal(10,2)
  heavyItemSurcharge Decimal? @db.Decimal(10,2)
  bulkyItemSurcharge Decimal? @db.Decimal(10,2)
  packingSurcharge   Decimal? @db.Decimal(10,2)
  assemblySurcharge  Decimal? @db.Decimal(10,2)
  urgencySurcharge   Decimal? @db.Decimal(10,2)
  sameDaySurcharge   Decimal? @db.Decimal(10,2)
  eveningNightSurcharge Decimal? @db.Decimal(10,2)
  weekendHolidaySurcharge Decimal? @db.Decimal(10,2)
  internationalBase  Decimal? @db.Decimal(10,2)
  tollsFlat          Decimal? @db.Decimal(10,2)
  parkingFlat        Decimal? @db.Decimal(10,2)
  waitingPerHour     Decimal? @db.Decimal(10,2)
  extraStopRate      Decimal? @db.Decimal(10,2)

  // Перевизначення ставки за типом авто (опційно)
  perVehicleType     Json?     // { "LUTON": {"perMileRate": 2.5}, ... }
}
```

### 2.3 Документи

```prisma
enum DocumentType { DRIVING_LICENCE MOT MOTOR_INSURANCE GOODS_IN_TRANSIT PUBLIC_LIABILITY COMPANY_REGISTRATION }
enum DocumentStatus { NOT_UPLOADED PENDING VERIFIED REJECTED EXPIRED UPDATE_REQUIRED }

model Document {
  id             String @id @default(cuid())
  carrierId      String
  type           DocumentType
  fileKey        String?        // ключ у приватному сховищі (не публічний URL)
  documentNumber String?
  issueDate      DateTime?
  expiryDate     DateTime?
  status         DocumentStatus @default(NOT_UPLOADED)
  adminComment   String?
  verifiedAt     DateTime?
  verifiedById   String?
  @@unique([carrierId, type])
}
```

### 2.4 Довідники: напрямки та послуги

```prisma
enum AreaType { CITY REGION COUNTRY }

model Area {
  id       String @id @default(cuid())
  name     String
  slug     String @unique
  type     AreaType
  country  String            // UK, FR, DE...
  isPopular Boolean @default(false)   // для головної
  carriers CarrierArea[]
}
model CarrierArea { carrierId String; areaId String; @@id([carrierId, areaId]) }

model ServiceType {          // 13 типів; таблиця, щоб адмін міг керувати
  id       String @id @default(cuid())
  code     String @unique    // HOUSE_REMOVALS, MAN_AND_VAN, EUROPEAN_TRANSPORT...
  name     String
  carriers CarrierService[]
}
model CarrierService { carrierId String; serviceId String; @@id([carrierId, serviceId]) }
```

### 2.5 Доступність (календар)

```prisma
model Availability {
  id        String  @id @default(cuid())
  carrierId String
  vehicleId String?          // null = весь перевізник
  date      DateTime @db.Date
  isBlocked Boolean @default(false)   // недоступний
  note      String?
  @@index([carrierId, date])
}
```

### 2.6 Замовлення / Booking

```prisma
enum OrderStatus {
  NEW                 // подано, очікує на перевізника
  INFO_REQUESTED      // перевізник просить деталі
  DECLINED
  BOOKING_CONFIRMED   // перевізник прийняв
  SCHEDULED
  DRIVER_ON_THE_WAY
  ARRIVED
  LOADING
  IN_TRANSIT
  UNLOADING
  COMPLETED
  CANCELLED
}

model Order {
  id             String  @id @default(cuid())
  reference      String  @unique     // людський BookingID, напр. RM-2K7QP
  customerUserId String?             // null = гість
  customer       User?   @relation("CustomerOrders", fields: [customerUserId], references: [id])
  carrierId      String
  carrier        Carrier @relation(fields: [carrierId], references: [id])

  // Контакти (для гостя обов'язкові)
  contactName    String
  contactPhone   String
  contactEmail   String

  serviceCode    String              // → ServiceType.code

  // Маршрут
  pickupAddress   String
  pickupLat       Float?
  pickupLng       Float?
  deliveryAddress String
  deliveryLat     Float?
  deliveryLng     Float?
  distanceMiles   Float?
  estimatedDurationMin Int?

  date           DateTime
  preferredTime  String?

  // Об'єкт
  propertyType   String?
  pickupFloor    Int?    @default(0)
  deliveryFloor  Int?    @default(0)
  liftAvailable  Boolean @default(false)

  // Перевезення
  requiredVehicleType VehicleType?
  numberOfHelpers Int    @default(0)
  itemsList      Json?
  specialItems   Json?
  services       Json?               // {packing:true, assembly:false,...}
  additionalNotes String? @db.Text
  photos         OrderPhoto[]

  // Ціна — ОРІЄНТОВНА
  estimatedPrice Decimal? @db.Decimal(10,2)
  priceBreakdown Json?               // прозорий розклад (див. §3)

  status         OrderStatus @default(NEW)
  statusHistory  OrderStatusHistory[]
  review         Review?

  createdAt      DateTime @default(now())
  confirmedAt    DateTime?
  completedAt    DateTime?
  cancelledAt    DateTime?
  cancelReason   String?
  cancelledByRole Role?
  // БЕЗ полів deposit / commission / payment
}

model OrderPhoto { id String @id @default(cuid()); orderId String; url String }

model OrderStatusHistory {
  id        String @id @default(cuid())
  orderId   String
  fromStatus OrderStatus?
  toStatus  OrderStatus
  changedByRole Role?
  note      String?
  createdAt DateTime @default(now())
}
```

### 2.7 Відгуки

```prisma
enum ReviewStatus { PENDING PUBLISHED HIDDEN REJECTED }

model Review {
  id          String  @id @default(cuid())
  orderId     String  @unique          // 1 відгук на замовлення
  carrierId   String
  authorUserId String?
  authorName  String                    // «John D.» — скорочене відображення

  overall     Int
  punctuality Int?
  communication Int?
  quality     Int?
  care        Int?
  vehicleCondition Int?
  priceAccuracy Int?

  text        String? @db.Text
  status      ReviewStatus @default(PENDING)
  carrierResponse String? @db.Text
  carrierRespondedAt DateTime?
  isDemo      Boolean @default(false)

  submitToken String? @unique          // персональне посилання з email
  createdAt   DateTime @default(now())
}
```

### 2.8 Адмінка: скарги, кампанії (промокоди — відкладено)

```prisma
model Complaint {
  id           String @id @default(cuid())
  type         String            // customer|carrier
  orderId      String?
  reason       String
  description  String? @db.Text
  attachments  Json?
  status       String @default("OPEN")   // OPEN|IN_REVIEW|RESOLVED
  assignedAdminId String?
  resolution   String?
  createdAt    DateTime @default(now())
}

model EmailCampaign {
  id          String @id @default(cuid())
  name        String
  segment     String            // customers|carriers|...
  subject     String
  body        String  @db.Text
  scheduledAt DateTime?
  sentAt      DateTime?
  stats       Json?             // opens/clicks
}

model EmailLog {              // транзакційні листи (статус, запит відгуку)
  id        String @id @default(cuid())
  to        String
  template  String
  orderId   String?
  status    String            // queued|sent|failed
  createdAt DateTime @default(now())
}
```

> **Promo Codes** — таблицю НЕ створюємо у v1 (механізм знижки був зав'язаний на оплату).
> Прапорець на майбутнє, якщо з'явиться монетизація.

---

## 3. Движок розрахунку ціни (орієнтовна оцінка)

**Вхід:** параметри `Order` + `PricingProfile` перевізника + маршрут (відстань/час із карт).

**Крок 1 — фільтр придатних перевізників** (до розрахунку показуємо лише тих, хто):
1. `isPublished == true` (APPROVED, не SUSPENDED, не заблокований);
2. документи не прострочені (немає `EXPIRED`/`UPDATE_REQUIRED` серед обов'язкових);
3. покриває маршрут (`CarrierArea` / `europeTransport` для міжнародних);
4. має **активне авто**, що підходить за габаритами/вантажопідйомністю;
5. **доступний на дату** (немає `Availability.isBlocked`);
6. надає обраний `serviceCode`.

**Крок 2 — розклад ціни** (адитивна модель, зберігається в `priceBreakdown`):

```
billableFloors = (lift ? 0 : pickupFloor + deliveryFloor)

subtotal =
    baseRate
  + perMileRate * distanceMiles
  + perHourRate * estimatedHours            // час навантаження+дорога
  + helperRate  * numberOfHelpers
  + floorSurcharge * billableFloors
  + (noLift && billableFloors>0 ? noLiftSurcharge : 0)
  + heavyItemSurcharge * heavyItemsCount
  + bulkyItemSurcharge * bulkyItemsCount
  + (packing  ? packingSurcharge  : 0)
  + (assembly ? assemblySurcharge : 0)
  + (international ? internationalBase + tollsFlat : 0)
  + extraStops * extraStopRate

// надбавки за час/терміновість (сума, не множник — простіше й прозоріше)
surcharge =
    (sameDay ? sameDaySurcharge : 0)
  + (urgent  ? urgencySurcharge  : 0)
  + (eveningNight ? eveningNightSurcharge : 0)
  + (weekendHoliday ? weekendHolidaySurcharge : 0)

estimate = max(subtotal + surcharge, minimumCharge)
```

- **Відстань/час** — геокодинг адрес + distance matrix (Google/Mapbox), результат кешуємо.
- Кожен перевізник має власні тарифи → у видачі **різні** оцінки (те, що й порівнюємо).
- UI скрізь формулює як **«Estimated price from £X»**, а не рахунок.
- `priceBreakdown` показуємо клієнту → «повна прозорість формування ціни» з брифу.

**Відкрите на затвердження:** брати `perHourRate` і `perMileRate` **разом** (адитивно, як вище)
чи `max(distance-based, time-based)`. Пропоную адитивно — простіше й передбачувано.

---

## 4. Машина станів бронювання

```
                 ┌───────────── DECLINED (кінець)
NEW ──carrier──► ├───────────── INFO_REQUESTED ──► NEW
                 └──accept────► BOOKING_CONFIRMED
                                      │
                                      ▼
                                  SCHEDULED ─► DRIVER_ON_THE_WAY ─► ARRIVED
                                      │                                │
                                      ▼                                ▼
                                   LOADING ─► IN_TRANSIT ─► UNLOADING ─► COMPLETED ─► (review)
```

- **CANCELLED** — можливий з будь-якого стану до `COMPLETED` (клієнтом або перевізником);
  фіксуємо `cancelReason`, `cancelledByRole`; впливає на статистику/рейтинг, **не на гроші**.
- Кожна зміна → запис у `OrderStatusHistory`.
- Дозволені переходи й ролі, що їх ініціюють, — жорсткі інваріанти (валідація на сервері).
- Після `COMPLETED` → генеруємо `Review.submitToken` і шлемо клієнту email із посиланням.

---

## 5. Архітектура застосунку (Next.js App Router)

```
app/
  [locale]/
    (public)/            # головна, каталог, /carrier/[slug], become-a-partner, FAQ
    (auth)/              # login, register (9 кроків), forgot-password
    (customer)/          # кабінет клієнта: історія замовлень
    (carrier)/           # кабінет перевізника: dashboard, jobs, profile, vehicles...
    (admin)/             # кастомна адмінка /admin/*
  api/
    documents/[id]/      # приватна віддача файлів (перевірка ролі)
    cron/                # ендпойнти для Hostinger cron (секрет у заголовку)
    webhooks/ ...
components/
  ui/                    # shadcn-компоненти (кнопки, інпути...)
  features/              # картка перевізника, форма бронювання, фільтри...
  motion/                # обгортки анімацій (Motion)
lib/
  db.ts (Prisma)  auth.ts (Auth.js)  pricing/  maps/  email/  ranking/
server/
  services/              # бізнес-логіка (booking, verification, reviews...)
prisma/schema.prisma
messages/en.json         # i18n (next-intl), далі uk/pl/ro
```

**Ключові рішення:**
- **Server Components** для читання даних, **Server Actions** для мутацій; Prisma лише на сервері.
- **Auth.js (credentials)**, роль у сесії/JWT; `middleware.ts` — рольова охорона груп маршрутів.
- **Приватні файли**: документи в приватному каталозі, віддаємо через `api/documents/[id]`
  з перевіркою прав (перевізник — свої; адмін — усі; клієнт — ніколи).
- **Фонові задачі** через **Hostinger cron → `api/cron/*`** (захищено секретом):
  нагадування про строки документів, перерахунок `rankingScore`/агрегатів, розсилка
  запитів на відгук, оновлення статусів `EXPIRED` для документів.
- **i18n**: next-intl, `[locale]`-сегмент; на старті лише `en`, рядки не хардкодимо.
- **Дизайн-система**: Tailwind-токени (кислотно-зелений акцент), shadcn/ui, Motion —
  спільні для фронту й адмінки.
- **Ранжування** (`lib/ranking`): `rankingScore` = f(повнота профілю, верифікація,
  активність, свіжість, [потім] рейтинг+виконані). Перерахунок на подіях/cron.

---

## 6. Наскрізні правила cold start (нагадування для реалізації)

- Рейтинг `avgRating` **nullable**; UI: `null` → бейдж **New**, `≥3 відгуки` → число.
- Ніколи не рендерити `0.0 ★`/«0 reviews» цифрою — приховати або позитивне формулювання.
- «Recommended»/«Top» на старті — за `rankingScore` (повнота+верифікація+свіжість), + `isFeatured`.
- Сортування «Highest Rating» тощо — з fallback tie-break на повноту+свіжість.

---

## 7. Дорожня карта (повний обсяг, кожна фаза — з перевіркою)

| Фаза | Зміст | Перевірка (Definition of Done) |
|---|---|---|
| **0. Фундамент** | Next.js+TS, Tailwind/shadcn, Prisma+MySQL, Auth.js+ролі, i18n-каркас, дизайн-токени | білд+typecheck; логін під 3 ролі; порожня БД мігрує |
| **1. Модель+довідники** | Уся Prisma-схема, сідери (Area, ServiceType), приватне сховище файлів | міграції; сідери; віддача файлу лише авторизованим |
| **2. Публіка+пошук+каталог** | Головна, форма пошуку, каталог із фільтрами/сортуванням, картка (cold start), сторінка перевізника | наскрізна передача фільтрів; фільтр придатних; гарні нулі |
| **3. Флоу бронювання** | Багатокрокова форма, движок ціни, створення заявки, машина станів | оцінка рахується; заявка створюється; переходи валідні |
| **4. Кабінет перевізника** | Dashboard, Jobs (Accept/Decline/статуси), Profile/Vehicle/Document/Pricing, Calendar | перевізник веде замовлення; тарифи впливають на оцінку |
| **5. Верифікація+адмінка** | Реєстрація 9 кроків, модерація, кастомна адмінка (клієнти/перевізники/замовлення/скарги/статистика) | новий перевізник Pending→Approved→з'являється в каталозі |
| **6. Відгуки** | Токен-флоу після Completed, критерії, модерація, перерахунок рейтингу | відгук лише по завершеному; рейтинг оновлюється |
| **7. Полірування** | Motion-анімації, next-intl контент, email (SMTP), email-кампанії, демо-контент | анімації; листи йдуть; демо відокремлене |
| **8. Реліз** | Автодеплой Hostinger, cron, env, бекапи | сайт живий; cron працює; документи приватні |

**Перевірка кожної фази** — не лише typecheck: проганяємо відповідний флоу в реальному
застосунку (skill `verify`/`run`) і дивимось поведінку, а не тільки тести.

---

## 8. Затверджені рішення

1. ✅ **Гостьове бронювання** — заявка без реєстрації (контакти в `Order`), акаунт опційний.
2. ✅ **Формула ціни** — адитивна (миля+година разом), як у §3.
3. ✅ **PricingProfile** — один на перевізника з опційними перевизначеннями за типом авто.
4. ✅ **Promo Codes** — відкладено до появи монетизації.
5. ✅ **Карти/відстань — безкоштовний провайдер: OpenRouteService** (безкоштовний ключ,
   геокодинг + distance matrix, без платіжної картки). Реалізуємо **за абстракцією**
   (`lib/maps`) з **кешуванням** відстаней у БД, щоб не впиратись у денні ліміти й мати
   змогу змінити провайдера (Nominatim/Mapbox/Google) без переписування движка ціни.
   Ключ ORS — у env; отримати на openrouteservice.org.

**Досі відкрите:**
- **Монетизація** — як платформа заробляє (підписка/лід/реклама). На модель даних поки
  не впливає (жодних `Payment`), але тримаємо в голові для v2.

---

## 9. Нотатки реалізації (v1) — прагматичні відхилення від плану

Реалізовано на **Next.js 16 (App Router) + React 19 + Tailwind v4 + Prisma 6**. Свідомі
відхилення, зроблені заради стабільної збірки й локального запуску:

- **Авторизація — власний JWT-шар** (`jose` + `bcryptjs` + httpOnly-cookie), а не
  Auth.js. Причина: надійність на «свіжому» Next 16. Модель ролей та сама; заміна на
  Auth.js локальна (`lib/auth.ts`). Гард ролей — у layout-ах груп маршрутів (не middleware).
- **Локальна БД — SQLite**, прод — MySQL (Hostinger). Схема портативна: enum-и як
  String (`lib/enums.ts`), гроші як Float (оплат немає). Перехід — зміна `provider` + URL.
- **Движок відстані** — `lib/maps.ts` за абстракцією: OpenRouteService за наявності
  `ORS_API_KEY`, інакше офлайн-оцінка (`lib/uk-geo.ts`, haversine × 1.3) з кешем.
- **Ціна** — чиста функція `lib/pricing.ts` (працює і на клієнті для live-оцінки, і на
  сервері для авторитетного розрахунку при створенні заявки).
- **Відгуки** — персональне посилання з підписаним токеном (`lib/review-token.ts`, HMAC,
  без зберігання). Новий відгук → `PUBLISHED` (рейтинг оновлюється автоматично) з
  пост-модерацією адміном. Агрегати перераховуються в `carrier-aggregates.ts`.
- **Заглушки (не бекенд-логіка, а UI/інтеграції):** завантаження файлів документів/фото
  (UI готовий, статуси — із сідера); реальна відправка email (пишемо `EmailLog`, SMTP —
  окремо); email-кампанії та промокоди (за планом відкладені); повне next-intl
  [locale]-роутування (є словник `messages/en.json` + `lib/i18n.ts` як каркас).
- **Перевірено:** `npm run build` (24 маршрути), typecheck, наскрізні флоу — верифікація
  (PENDING→APPROVED→у каталозі), переходи станів (дозволені/заблоковані), бронювання
  (карти→ціна→заявка), токен відгуку (валідний/битий), рольові гарди.

---

## 10. Преміум-редизайн під референс Transio (UI/UX)

Повний редизайн presentation-шару під transio.webflow.io зі збереженням **усієї**
логіки/API/форм/маршрутів/текстів/даних (лише класи, розмітка-обгортки, анімації).

**Дизайн-система** (з аналізу CSS/HTML/JS референсу): синій акцент `#146ef5`; Urbanist +
Inter Tight; flat-premium (тонкі межі `#e0e6eb`, тіні-шепіт); контейнер 1220px; ритм
секцій `clamp(64px,8vw,120px)`; типографічна шкала `.display-*`.

**Мотив-система** (`components/motion/reveal.tsx`, Motion/motion.dev): scroll-reveal
(opacity 0→1 + translateY 60px→0 + blur 8→0, ease-out 0.7s, `once:true`), stagger 0.08s,
hero-load `FadeUp`, `ZoomImage`, rolling-text кнопки (`.btn-roll`), sticky-nav shrink.
`prefers-reduced-motion` вимикає рух.

**Що перероблено:** globals (токени/шкала/утиліти/motion), примітиви (button/card/field/
badge), хедер+футер, головна (hero з фото+форма+плаваючі бейджі, усі секції з reveal),
каталог, сторінка перевізника, auth (split з halo), дашборди (активний sidebar). Форми
booking/register та дашборд-логіка успадкували нові примітиви без зміни поведінки.

**Верифікація:** `npm run build` (24 маршрути ✓), typecheck ✓, скріншоти desktop+mobile
через `scripts/shot.mjs` (puppeteer, scroll-aware) — головна/каталог/перевізник/auth/
дашборд. Hero-фото у `public/images/*.webp` — стокові плейсхолдери, замінити на ліцензійні.

## §11. Композиційний редизайн головної + аудит-фікси (v3)

Другий прохід: не «перефарбування», а **композиція** секцій за розбором Transio.

**Головна — кожна секція має власну візуальну ідею** (усі тексти/дані/логіка збережені):
- **Hero** — split + фото; стат-стрічка з `CountUp` на чесних, обчислюваних фактах
  (4 UK-нації, 9 EU-країн, 10+ послуг, £0 онлайн) — cold-start-safe, без вигаданих цифр.
- **Cities** — image-led bento: перша плитка `col-span-2 row-span-2`, фото `dest-*.jpg`,
  градієнт+пульс-точка; наскрізні `from/to` лінки збережені.
- **Coverage map** — `world-map.svg` + декоративні пульсуючі пін-маркери (UK↔EU).
- **Advantages** — асиметрія `[0.9fr_1.1fr]`: ліворуч sticky media-rail з glass-caption,
  праворуч 2-кол icon-tiles; один темний акцент-тайл («No Upfront Payment»).
- **How it works** — **sticky-stacking** картки (CSS `position:sticky` + інкремент `top`),
  фото `step-*.jpg`, сторони чергуються; на мобільному — звичайний стек.
- **Reviews** — CSS-**marquee** (`components/motion/marquee.tsx`, дубльований трек,
  пауза на hover, вимкнення в reduced-motion), аватар-ініціали.
- **FAQ** — 2 колонки: sticky-заголовок ліворуч + акордеон праворуч.
- **CTA** — full-bleed `cta.jpg` + плаваюча контент-картка.

**Нові примітиви:** `globals.css` — `.marquee/.marquee-track/.marquee-mask`,
`.pulse-dot` (concentric ping), `.img-overlay-hover`; `reveal.tsx` — `CountUp`
(useInView + animate, нечислове рендериться як є). Reduced-motion гасить marquee/pulse.

**Аудит-фікси (2 фонові агенти: розбір референсу + вичитка коду):**
- **Select без стрілки** → синій шеврон data-URI у `field.tsx` (фікс усіх dropdown-ів).
- **carrier-card** конфлікт `mt-auto`+`mt-4` → футери карток вирівняні в ряду.
- **admin/customers** таблиця без `overflow-x-auto` → обгорнуто + `min-w` (та orders).
- **Степери** booking/register: завершений крок `bg-brand text-white` (був text-ink-strong).
- **Сирий enum** → `DOCUMENT_STATUS_LABELS` (карта перевізника, документи).
- Радіус карток уніфіковано на 18px (токен + search-form); `SectionTitle align="center"`
  (mx-auto subtitle); dash-shell `max-w-[1400px] mx-auto`; amber→`--color-warning`;
  StatCard icon-chip; ragged stat-сітки (md-крок); sticky-offset уніфіковано `top-24`.

**Нові ассети:** `public/images/dest-1..5`, `step-1..4`, `service-1..3`, `cta.jpg`,
`world-map.svg` (стокові з шаблону Transio — замінити на ліцензійні у проді).
