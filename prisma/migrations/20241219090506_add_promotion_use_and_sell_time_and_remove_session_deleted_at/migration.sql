/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `voucher_promotion` table. All the data in the column will be lost.
  - Added the required column `name` to the `voucher_promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sell_expired_at` to the `voucher_promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sell_started_at` to the `voucher_promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usable_expired_at` to the `voucher_promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usable_started_at` to the `voucher_promotion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "voucher_promotion" DROP COLUMN "started_at",
ADD COLUMN     "name" VARCHAR(191) NOT NULL,
ADD COLUMN     "sell_expired_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "sell_started_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "usable_expired_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "usable_started_at" TIMESTAMPTZ(3) NOT NULL;
