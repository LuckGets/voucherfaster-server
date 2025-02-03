/*
  Warnings:

  - Added the required column `updated_at` to the `package_quota_voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `package_reward_voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "package_quota_voucher" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "package_reward_voucher" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;
