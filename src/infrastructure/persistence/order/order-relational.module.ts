import { Module } from '@nestjs/common';
import { OrderRelationalPrismaORMRepository } from './prisma-relational/order.repository';
import { OrderRepository } from './order.repository';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: OrderRepository,
      useClass: OrderRelationalPrismaORMRepository,
    },
  ],
  exports: [OrderRepository],
})
export class OrderRelationalPersistenceModule {}
