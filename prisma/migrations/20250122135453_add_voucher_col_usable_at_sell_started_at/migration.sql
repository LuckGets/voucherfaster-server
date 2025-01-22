/*
  Warnings:

  - Added the required column `sell_started_at` to the `voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usable_started_at` to the `voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "voucher" ADD COLUMN     "sell_started_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "usable_started_at" TIMESTAMPTZ(3) NOT NULL;
