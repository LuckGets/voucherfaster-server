import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRelationalPersistenceModule } from 'src/infrastructure/persistence/product/product-relational.module';

@Module({
  imports: [ProductRelationalPersistenceModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
