/*
  Warnings:

  - You are about to drop the column `code` on the `voucher` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "voucher_code_key";

-- AlterTable
ALTER TABLE "voucher" DROP COLUMN "code";

-- CreateTable
CREATE TABLE "package_voucher_term_condition_th" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "package_voucher_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "inactive_at" TIMESTAMPTZ(3),

    CONSTRAINT "package_voucher_term_condition_th_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_voucher_term_condition_en" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "package_voucher_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "inactive_at" TIMESTAMPTZ(3),

    CONSTRAINT "package_voucher_term_condition_en_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "package_voucher_term_condition_th" ADD CONSTRAINT "package_voucher_term_condition_th_package_voucher_id_fkey" FOREIGN KEY ("package_voucher_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_voucher_term_condition_en" ADD CONSTRAINT "package_voucher_term_condition_en_package_voucher_id_fkey" FOREIGN KEY ("package_voucher_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
