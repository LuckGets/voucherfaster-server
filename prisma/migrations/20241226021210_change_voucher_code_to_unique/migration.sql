/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `voucher` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "voucher_code_key" ON "voucher"("code");
