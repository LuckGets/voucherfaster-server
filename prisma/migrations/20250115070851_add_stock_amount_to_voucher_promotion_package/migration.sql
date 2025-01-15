/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `OwnerImg` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `package_img` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock_amount` to the `package_voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock_amount` to the `voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock_amount` to the `voucher_promotion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OwnerImg" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "account_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "package_img" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "package_voucher" ADD COLUMN     "stock_amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "voucher" ADD COLUMN     "stock_amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "voucher_promotion" ADD COLUMN     "stock_amount" INTEGER NOT NULL;
