import {
  ProductDomain,
  ProductDomainList,
} from '@resources/product/domain/product.domain';
import {
  GetProductQueries,
  ProductSortQueryEnum,
} from '@resources/product/dto/get-product.dto';

export abstract class ProductRepository {
  abstract findMany(queries: GetProductQueries): Promise<ProductDomainList>;
}
