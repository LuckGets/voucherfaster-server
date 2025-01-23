import { Module } from '@nestjs/common';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';
import { OrderItemRelationalPersistenceModule } from 'src/infrastructure/persistence/order-item/order-item-relational.module';
import { OwnerService } from '@resources/owner/owner.service';

@Module({
  imports: [OrderItemRelationalPersistenceModule],
  controllers: [OrderItemController],
  providers: [OrderItemService, OwnerService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
