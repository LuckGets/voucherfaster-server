/*
  Warnings:

  - You are about to drop the `TransactionSystem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoucherCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoucherTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VoucherTag" DROP CONSTRAINT "VoucherTag_category_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_transaction_system_id_fkey";

-- DropForeignKey
ALTER TABLE "voucher" DROP CONSTRAINT "voucher_tag_id_fkey";

-- DropTable
DROP TABLE "TransactionSystem";

-- DropTable
DROP TABLE "VoucherCategory";

-- DropTable
DROP TABLE "VoucherTag";

-- CreateTable
CREATE TABLE "voucher_category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(90) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "voucher_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_map" (
    "id" UUID NOT NULL,
    "name" VARCHAR(90) NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "voucher_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_system" (
    "id" UUID NOT NULL,
    "system" VARCHAR(90) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "transaction_system_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_system_system_key" ON "transaction_system"("system");

-- AddForeignKey
ALTER TABLE "voucher_map" ADD CONSTRAINT "voucher_map_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "voucher_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "voucher_map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_transaction_system_id_fkey" FOREIGN KEY ("transaction_system_id") REFERENCES "transaction_system"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
