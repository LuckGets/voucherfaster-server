import { Module } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { ProductRelationalPrismaORMRepository } from './prisma-relational/product.repository';
import { ProductPrismaSQLRepository } from 'prisma/sql/product';

@Module({
  providers: [
    {
      provide: ProductRepository,
      useClass: ProductRelationalPrismaORMRepository,
    },
    ProductPrismaSQLRepository,
  ],
  exports: [ProductRepository],
})
export class ProductRelationalPersistenceModule {}
