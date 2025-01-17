import { Module } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';
import { OrderItemRepository } from './order-item.repository';
import { OrderItemRelationPrismaORMRepository } from './prisma-relational/order-item.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: OrderItemRepository,
      useClass: OrderItemRelationPrismaORMRepository,
    },
  ],
  exports: [OrderItemRepository],
})
export class OrderItemRelationalPersistenceModule {}
