/*
  Warnings:

  - You are about to drop the column `main_color_code` on the `owner` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `OwnerImg` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color_code` to the `owner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_for_email` to the `owner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_for_redeem` to the `owner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `owner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OwnerImg" ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "owner" DROP COLUMN "main_color_code",
ADD COLUMN     "color_code" VARCHAR(90) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password_for_email" VARCHAR(191) NOT NULL,
ADD COLUMN     "password_for_redeem" VARCHAR(191) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;
