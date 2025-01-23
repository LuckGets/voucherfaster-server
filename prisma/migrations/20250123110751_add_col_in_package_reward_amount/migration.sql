/*
  Warnings:

  - Added the required column `amount` to the `package_reward_voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "package_reward_voucher" ADD COLUMN     "amount" INTEGER NOT NULL;
