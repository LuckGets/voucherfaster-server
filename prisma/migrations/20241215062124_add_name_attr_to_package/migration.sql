/*
  Warnings:

  - Added the required column `name` to the `package_voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "package_voucher" ADD COLUMN     "name" VARCHAR(191) NOT NULL;
