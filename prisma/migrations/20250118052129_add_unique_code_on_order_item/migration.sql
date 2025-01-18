/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `order_item` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `order_item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "code" VARCHAR(40) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "order_item_code_key" ON "order_item"("code");
