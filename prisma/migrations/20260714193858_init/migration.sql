-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "name" TEXT,
    "phone" TEXT,
    "companyName" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "emailVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Carrier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "businessType" TEXT NOT NULL DEFAULT 'OWNER_DRIVER',
    "companyRegNumber" TEXT,
    "registeredAddress" TEXT,
    "city" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "languages" JSONB,
    "workingHours" JSONB,
    "europeTransport" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "avgRating" REAL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "cancelledJobs" INTEGER NOT NULL DEFAULT 0,
    "completionRate" REAL,
    "avgResponseMinutes" INTEGER,
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "rankingScore" REAL NOT NULL DEFAULT 0,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Carrier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carrierId" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "bodyType" TEXT,
    "loadCapacityKg" INTEGER,
    "internalLengthCm" INTEGER,
    "internalWidthCm" INTEGER,
    "internalHeightCm" INTEGER,
    "volumeM3" REAL,
    "passengerSeats" INTEGER DEFAULT 0,
    "tailLift" BOOLEAN NOT NULL DEFAULT false,
    "equipment" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Vehicle_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehiclePhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'side',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "VehiclePhoto_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricingProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carrierId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "baseRate" REAL NOT NULL DEFAULT 0,
    "perMileRate" REAL NOT NULL DEFAULT 0,
    "perHourRate" REAL NOT NULL DEFAULT 0,
    "minimumCharge" REAL NOT NULL DEFAULT 0,
    "helperRate" REAL,
    "floorSurcharge" REAL,
    "noLiftSurcharge" REAL,
    "heavyItemSurcharge" REAL,
    "bulkyItemSurcharge" REAL,
    "packingSurcharge" REAL,
    "assemblySurcharge" REAL,
    "urgencySurcharge" REAL,
    "sameDaySurcharge" REAL,
    "eveningNightSurcharge" REAL,
    "weekendHolidaySurcharge" REAL,
    "internationalBase" REAL,
    "tollsFlat" REAL,
    "parkingFlat" REAL,
    "waitingPerHour" REAL,
    "extraStopRate" REAL,
    "perVehicleType" JSONB,
    CONSTRAINT "PricingProfile_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carrierId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileKey" TEXT,
    "documentNumber" TEXT,
    "issueDate" DATETIME,
    "expiryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'NOT_UPLOADED',
    "adminComment" TEXT,
    "verifiedAt" DATETIME,
    "verifiedById" TEXT,
    CONSTRAINT "Document_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CITY',
    "country" TEXT NOT NULL DEFAULT 'UK',
    "isPopular" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "CarrierArea" (
    "carrierId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,

    PRIMARY KEY ("carrierId", "areaId"),
    CONSTRAINT "CarrierArea_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CarrierArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CarrierService" (
    "carrierId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    PRIMARY KEY ("carrierId", "serviceId"),
    CONSTRAINT "CarrierService_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CarrierService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carrierId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "date" DATETIME NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    CONSTRAINT "Availability_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "customerUserId" TEXT,
    "carrierId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" REAL,
    "pickupLng" REAL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLat" REAL,
    "deliveryLng" REAL,
    "distanceMiles" REAL,
    "estimatedDurationMin" INTEGER,
    "date" DATETIME NOT NULL,
    "preferredTime" TEXT,
    "propertyType" TEXT,
    "pickupFloor" INTEGER NOT NULL DEFAULT 0,
    "deliveryFloor" INTEGER NOT NULL DEFAULT 0,
    "liftAvailable" BOOLEAN NOT NULL DEFAULT false,
    "requiredVehicleType" TEXT,
    "numberOfHelpers" INTEGER NOT NULL DEFAULT 0,
    "itemsList" JSONB,
    "specialItems" JSONB,
    "services" JSONB,
    "additionalNotes" TEXT,
    "estimatedPrice" REAL,
    "priceBreakdown" JSONB,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancelReason" TEXT,
    "cancelledByRole" TEXT,
    CONSTRAINT "Order_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "OrderPhoto_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedByRole" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "authorName" TEXT NOT NULL,
    "overall" INTEGER NOT NULL,
    "punctuality" INTEGER,
    "communication" INTEGER,
    "quality" INTEGER,
    "care" INTEGER,
    "vehicleCondition" INTEGER,
    "priceAccuracy" INTEGER,
    "text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "carrierResponse" TEXT,
    "carrierRespondedAt" DATETIME,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "submitToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "orderId" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "attachments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedAdminId" TEXT,
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "stats" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "orderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_userId_key" ON "Carrier"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_slug_key" ON "Carrier"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PricingProfile_carrierId_key" ON "PricingProfile"("carrierId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_carrierId_type_key" ON "Document"("carrierId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Area_slug_key" ON "Area"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_code_key" ON "ServiceType"("code");

-- CreateIndex
CREATE INDEX "Availability_carrierId_date_idx" ON "Availability"("carrierId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_submitToken_key" ON "Review"("submitToken");
