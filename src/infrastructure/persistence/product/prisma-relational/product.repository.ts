import { Inject } from '@nestjs/common';
import { ProductRepository } from '../product.repository';
import { PrismaService } from '../../config/prisma.service';
import { GetProductQueries } from '@resources/product/dto/get-product.dto';
import {
  ProductDomain,
  ProductDomainList,
} from '@resources/product/domain/product.domain';
import {
  ProductCountRowName,
  ProductMapper,
  ProductRawSql,
  ProductTotalCountType,
} from './product.mapper';
import { ProductPrismaSQLRepository } from 'prisma/sql/product';

export class ProductRelationalPrismaORMRepository implements ProductRepository {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    private readonly productRawSqlRepository: ProductPrismaSQLRepository,
  ) {}

  async findMany(queries: GetProductQueries): Promise<ProductDomainList> {
    const { product, count } =
      this.productRawSqlRepository.getManyproducts(queries);
    const [products, counts]: [ProductRawSql[], ProductTotalCountType] =
      await Promise.all([
        this.prismaService.$queryRaw<ProductRawSql[]>(product),
        this.prismaService.$queryRaw<ProductTotalCountType>(count),
      ]);

    return ProductMapper.toDomainListFromRawSqlList(products, counts);
  }
}
