/*
  Warnings:

  - You are about to drop the column `expired_at` on the `package_voucher` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `package_voucher` table. All the data in the column will be lost.
  - You are about to drop the `OwnerImg` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sell_expired_at` to the `package_voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sell_started_at` to the `package_voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usable_at` to the `package_voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usable_expired_at` to the `package_voucher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OwnerImg" DROP CONSTRAINT "OwnerImg_owner_id_fkey";

-- AlterTable
ALTER TABLE "package_voucher" DROP COLUMN "expired_at",
DROP COLUMN "started_at",
ADD COLUMN     "sell_expired_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "sell_started_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "usable_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "usable_expired_at" TIMESTAMPTZ(3) NOT NULL;

-- DropTable
DROP TABLE "OwnerImg";

-- CreateTable
CREATE TABLE "owner_img" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "img_path" TEXT NOT NULL,
    "img_type" "OwnerImgType" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "owner_img_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "owner_img" ADD CONSTRAINT "owner_img_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
