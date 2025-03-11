/*
  Warnings:

  - You are about to drop the column `package_id` on the `order_item_package_quota` table. All the data in the column will be lost.
  - You are about to drop the column `package_id` on the `order_item_package_reward` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_item_package_quota" DROP CONSTRAINT "order_item_package_quota_package_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item_package_reward" DROP CONSTRAINT "order_item_package_reward_package_id_fkey";

-- AlterTable
ALTER TABLE "order_item_package_quota" DROP COLUMN "package_id",
ADD COLUMN     "packageVoucherId" UUID;

-- AlterTable
ALTER TABLE "order_item_package_reward" DROP COLUMN "package_id",
ADD COLUMN     "packageVoucherId" UUID;

-- AddForeignKey
ALTER TABLE "order_item_package_quota" ADD CONSTRAINT "order_item_package_quota_packageVoucherId_fkey" FOREIGN KEY ("packageVoucherId") REFERENCES "package_voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package_reward" ADD CONSTRAINT "order_item_package_reward_packageVoucherId_fkey" FOREIGN KEY ("packageVoucherId") REFERENCES "package_voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
