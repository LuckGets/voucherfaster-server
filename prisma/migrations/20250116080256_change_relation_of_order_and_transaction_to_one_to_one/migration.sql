/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "transaction_order_id_key" ON "transaction"("order_id");
