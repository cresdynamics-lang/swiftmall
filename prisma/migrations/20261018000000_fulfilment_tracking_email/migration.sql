-- Fulfilment, tracking, payment claims, status history, alerts

-- New enum values (Postgres)
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'COLLECTED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CUSTOMER_UNREACHABLE';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'DELIVERY_REFUSED';

ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'PAY_AT_PICKUP';

ALTER TYPE "PaymentState" ADD VALUE IF NOT EXISTS 'AWAITING_MPESA';

DO $$ BEGIN
  CREATE TYPE "FulfilmentType" AS ENUM ('DELIVERY', 'PICKUP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "DeliveryZone" AS ENUM ('NAIROBI', 'UPCOUNTRY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Customer.email optional
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL;

-- Order extensions
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingToken" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "privacyConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "fulfilment" "FulfilmentType" NOT NULL DEFAULT 'DELIVERY';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "zone" "DeliveryZone";
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "streetBuilding" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "landmark" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryNotes" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "collectorName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "amountExpected" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "amountConfirmed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "mpesaCode" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cashCollected" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cashCollectedBy" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cashCollectedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "riderName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "riderPhone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "dispatchNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

UPDATE "Order" SET "trackingToken" = md5(random()::text || id || clock_timestamp()::text) WHERE "trackingToken" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "trackingToken" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_trackingToken_key" ON "Order"("trackingToken");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

ALTER TABLE "Order" ALTER COLUMN "email" SET DEFAULT '';
ALTER TABLE "Order" ALTER COLUMN "county" SET DEFAULT '';
ALTER TABLE "Order" ALTER COLUMN "town" SET DEFAULT '';
ALTER TABLE "Order" ALTER COLUMN "address" SET DEFAULT '';

CREATE INDEX IF NOT EXISTS "Order_paymentState_idx" ON "Order"("paymentState");
CREATE INDEX IF NOT EXISTS "Order_fulfilment_idx" ON "Order"("fulfilment");
CREATE INDEX IF NOT EXISTS "Order_phone_idx" ON "Order"("phone");

ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "sku" TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS "OrderEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "actor" TEXT NOT NULL DEFAULT 'system',
    "notify" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OrderEvent_orderId_createdAt_idx" ON "OrderEvent"("orderId", "createdAt");
DO $$ BEGIN
  ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "OutboundEmail" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "error" TEXT NOT NULL DEFAULT '',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutboundEmail_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OutboundEmail_status_createdAt_idx" ON "OutboundEmail"("status", "createdAt");
DO $$ BEGIN
  ALTER TABLE "OutboundEmail" ADD CONSTRAINT "OutboundEmail_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "AdminAlert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "href" TEXT NOT NULL DEFAULT '/management/orders',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAlert_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AdminAlert_read_createdAt_idx" ON "AdminAlert"("read", "createdAt");

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT NOT NULL DEFAULT '',
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_orderId_idx" ON "AuditLog"("orderId");

UPDATE "StoreSettings" SET "contactEmail" = 'swiftmall@gmail.com' WHERE "contactEmail" = 'orders@swiftmall.co.ke';
