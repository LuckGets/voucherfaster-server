/*
  Warnings:

  - You are about to drop the column `package_price` on the `package_voucher` table. All the data in the column will be lost.
  - Added the required column `price` to the `package_voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "package_voucher" DROP COLUMN "package_price",
ADD COLUMN     "price" DECIMAL(8,2) NOT NULL;
