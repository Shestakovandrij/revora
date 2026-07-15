-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
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
    "cargoType" TEXT,
    "cargoWeightKg" INTEGER,
    "cargoLengthCm" INTEGER,
    "cargoWidthCm" INTEGER,
    "cargoHeightCm" INTEGER,
    "cargoVolumeM3" REAL,
    "cargoPlaces" INTEGER,
    "loadingMethod" TEXT,
    "unloadingMethod" TEXT,
    "fragile" BOOLEAN NOT NULL DEFAULT false,
    "loadingHelp" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_Order" ("additionalNotes", "cancelReason", "cancelledAt", "cancelledByRole", "carrierId", "completedAt", "confirmedAt", "contactEmail", "contactName", "contactPhone", "createdAt", "customerUserId", "date", "deliveryAddress", "deliveryFloor", "deliveryLat", "deliveryLng", "distanceMiles", "estimatedDurationMin", "estimatedPrice", "id", "itemsList", "liftAvailable", "numberOfHelpers", "pickupAddress", "pickupFloor", "pickupLat", "pickupLng", "preferredTime", "priceBreakdown", "propertyType", "reference", "requiredVehicleType", "serviceCode", "services", "specialItems", "status") SELECT "additionalNotes", "cancelReason", "cancelledAt", "cancelledByRole", "carrierId", "completedAt", "confirmedAt", "contactEmail", "contactName", "contactPhone", "createdAt", "customerUserId", "date", "deliveryAddress", "deliveryFloor", "deliveryLat", "deliveryLng", "distanceMiles", "estimatedDurationMin", "estimatedPrice", "id", "itemsList", "liftAvailable", "numberOfHelpers", "pickupAddress", "pickupFloor", "pickupLat", "pickupLng", "preferredTime", "priceBreakdown", "propertyType", "reference", "requiredVehicleType", "serviceCode", "services", "specialItems", "status" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
