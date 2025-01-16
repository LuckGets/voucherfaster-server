/*
  Warnings:

  - You are about to drop the column `voucher_usage_day_id` on the `order` table. All the data in the column will be lost.
  - You are about to drop the `voucher_usage_days` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `usable_days_after_purchased_id` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_voucher_usage_day_id_fkey";

-- AlterTable
ALTER TABLE "order" DROP COLUMN "voucher_usage_day_id",
ADD COLUMN     "usable_days_after_purchased_id" UUID NOT NULL;

-- DropTable
DROP TABLE "voucher_usage_days";

-- CreateTable
CREATE TABLE "usable_days_after_purchased" (
    "id" UUID NOT NULL,
    "usable_days" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "usable_days_after_purchased_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_usable_days_after_purchased_id_fkey" FOREIGN KEY ("usable_days_after_purchased_id") REFERENCES "usable_days_after_purchased"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
