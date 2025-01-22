/*
  Warnings:

  - You are about to drop the column `sale_expired_time` on the `voucher` table. All the data in the column will be lost.
  - You are about to drop the column `usage_expired_time` on the `voucher` table. All the data in the column will be lost.
  - Added the required column `expired_at` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sale_expired_at` to the `voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usage_expired_at` to the `voucher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionExpireUnit" AS ENUM ('SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR');

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "expired_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "voucher" DROP COLUMN "sale_expired_time",
DROP COLUMN "usage_expired_time",
ADD COLUMN     "sale_expired_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "usage_expired_at" TIMESTAMPTZ(3) NOT NULL;

-- CreateTable
CREATE TABLE "transaction_expire_time" (
    "id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "unit" "TransactionExpireUnit" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "transaction_expire_time_pkey" PRIMARY KEY ("id")
);
