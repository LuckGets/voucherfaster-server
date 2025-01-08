/*
  Warnings:

  - You are about to drop the column `package_voucher_id` on the `package_reward_voucher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "package_reward_voucher" DROP CONSTRAINT "package_reward_voucher_package_voucher_id_fkey";

-- AlterTable
ALTER TABLE "package_reward_voucher" DROP COLUMN "package_voucher_id";

-- AddForeignKey
ALTER TABLE "package_reward_voucher" ADD CONSTRAINT "package_reward_voucher_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
