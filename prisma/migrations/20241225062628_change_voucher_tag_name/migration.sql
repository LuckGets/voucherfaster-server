/*
  Warnings:

  - You are about to drop the `voucher_map` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "voucher" DROP CONSTRAINT "voucher_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "voucher_map" DROP CONSTRAINT "voucher_map_category_id_fkey";

-- DropTable
DROP TABLE "voucher_map";

-- CreateTable
CREATE TABLE "voucher_tag" (
    "id" UUID NOT NULL,
    "name" VARCHAR(90) NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "voucher_tag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "voucher_tag" ADD CONSTRAINT "voucher_tag_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "voucher_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "voucher_tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
