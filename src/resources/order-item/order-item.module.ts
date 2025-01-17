import { Module } from '@nestjs/common';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';
import { OrderItemRelationalPersistenceModule } from 'src/infrastructure/persistence/order-item/order-item-relational.module';

@Module({
  imports: [OrderItemRelationalPersistenceModule],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
