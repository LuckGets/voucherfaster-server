/*
  Warnings:

  - You are about to drop the column `quotaVoucher` on the `order_item_package` table. All the data in the column will be lost.
  - Added the required column `reward_voucher` to the `order_item_package` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_item_package" DROP COLUMN "quotaVoucher",
ADD COLUMN     "reward_voucher" BOOLEAN NOT NULL;
