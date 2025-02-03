/*
  Warnings:

  - You are about to drop the column `quota_amount` on the `package_voucher` table. All the data in the column will be lost.
  - You are about to drop the column `quota_voucher_id` on the `package_voucher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "package_voucher" DROP CONSTRAINT "package_voucher_quota_voucher_id_fkey";

-- AlterTable
ALTER TABLE "package_voucher" DROP COLUMN "quota_amount",
DROP COLUMN "quota_voucher_id";

-- CreateTable
CREATE TABLE "package_quota_voucher" (
    "id" UUID NOT NULL,
    "quota_voucher_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "package_id" UUID NOT NULL,

    CONSTRAINT "package_quota_voucher_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "package_quota_voucher" ADD CONSTRAINT "package_quota_voucher_quota_voucher_id_fkey" FOREIGN KEY ("quota_voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_quota_voucher" ADD CONSTRAINT "package_quota_voucher_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
