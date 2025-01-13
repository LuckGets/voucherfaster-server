/*
  Warnings:

  - You are about to drop the column `name` on the `package_voucher` table. All the data in the column will be lost.
  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `package_voucher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OwnerImgType" AS ENUM ('BACKGROUND', 'LOGO');

-- AlterTable
ALTER TABLE "package_voucher" DROP COLUMN "name",
ADD COLUMN     "title" VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE "Otp";

-- CreateTable
CREATE TABLE "owner" (
    "id" UUID NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "email_for_sending_voucher" VARCHAR(191) NOT NULL,
    "main_color_code" VARCHAR(90) NOT NULL,

    CONSTRAINT "owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerImg" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "img_path" TEXT NOT NULL,
    "img_type" "OwnerImgType" NOT NULL,

    CONSTRAINT "OwnerImg_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OwnerImg" ADD CONSTRAINT "OwnerImg_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
