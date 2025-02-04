/*
  Warnings:

  - You are about to drop the `order_item_package` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_item_package" DROP CONSTRAINT "order_item_package_order_item_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item_package" DROP CONSTRAINT "order_item_package_package_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item_package" DROP CONSTRAINT "order_item_package_package_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item_package" DROP CONSTRAINT "order_item_package_voucher_id_fkey";

-- DropTable
DROP TABLE "order_item_package";

-- CreateTable
CREATE TABLE "order_item_package_quota" (
    "id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "package_quota_voucher_id" UUID NOT NULL,
    "package_discount_id" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "order_item_package_quota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_package_reward" (
    "id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "package_reward_voucher_id" UUID NOT NULL,
    "package_discount_id" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "order_item_package_reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_item_package_quota_order_item_id_key" ON "order_item_package_quota"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_package_reward_order_item_id_key" ON "order_item_package_reward"("order_item_id");

-- AddForeignKey
ALTER TABLE "order_item_package_quota" ADD CONSTRAINT "order_item_package_quota_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package_quota" ADD CONSTRAINT "order_item_package_quota_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package_quota" ADD CONSTRAINT "order_item_package_quota_package_quota_voucher_id_fkey" FOREIGN KEY ("package_quota_voucher_id") REFERENCES "package_quota_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package_quota" ADD CONSTRAINT "order_item_package_quota_package_discount_id_fkey" FOREIGN KEY ("package_discount_id") REFERENCES "package_discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package_reward" ADD CONSTRAINT "order_item_package_reward_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package_reward" ADD CONSTRAINT "order_item_package_reward_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package_reward" ADD CONSTRAINT "order_item_package_reward_package_reward_voucher_id_fkey" FOREIGN KEY ("package_reward_voucher_id") REFERENCES "package_reward_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package_reward" ADD CONSTRAINT "order_item_package_reward_package_discount_id_fkey" FOREIGN KEY ("package_discount_id") REFERENCES "package_discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
