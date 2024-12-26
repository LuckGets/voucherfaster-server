/*
  Warnings:

  - You are about to drop the column `expired_at` on the `voucher_promotion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "voucher_promotion" DROP COLUMN "expired_at",
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);
