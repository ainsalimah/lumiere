BEGIN;
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "offerAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "paymentAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paymentNote" TEXT,
ADD COLUMN     "paymentRecordedAt" TIMESTAMP(3),
ADD COLUMN     "paymentRecordedBy" INTEGER,
ADD COLUMN     "recipientPhone" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "discount" INTEGER,
ADD COLUMN     "originalPrice" INTEGER,
ADD COLUMN     "productImage" TEXT,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "unitPrice" INTEGER;

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderEvent_orderId_occurredAt_idx" ON "OrderEvent"("orderId", "occurredAt");

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;


UPDATE "OrderItem" i SET "productName" = p.name, "productImage" = p.img FROM "Product" p WHERE p.id = i."productId";
UPDATE "Order" SET "recipientPhone" = NULLIF(substring(address from 'Kontak penerima: ([^\n]+)'), '-');
INSERT INTO "OrderEvent" ("orderId",status,action,"occurredAt") SELECT id,'Accepted','Permintaan dibuat',date FROM "Order";
COMMIT;
