/*
  Warnings:

  - You are about to drop the column `redeemed_at` on the `order_item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "redeemed_at";

-- CreateTable
CREATE TABLE "redeemed_order_item" (
    "id" UUID NOT NULL,
    "orderItemId" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "redeemed_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "redeemed_order_item_orderItemId_key" ON "redeemed_order_item"("orderItemId");

-- AddForeignKey
ALTER TABLE "redeemed_order_item" ADD CONSTRAINT "redeemed_order_item_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
