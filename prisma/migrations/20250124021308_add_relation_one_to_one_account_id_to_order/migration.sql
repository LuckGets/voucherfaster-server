-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
