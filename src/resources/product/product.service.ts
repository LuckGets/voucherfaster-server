import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/infrastructure/persistence/product/product.repository';
import { ProductDomain, ProductDomainList } from './domain/product.domain';
import {
  GetProductQueries,
  ProductDiscountQueryEnum,
  ProductSellDateQueryEnum,
  ProductStatusQueryEnum,
} from './dto/get-product.dto';
import { isString, isUUID } from 'class-validator';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  public async getMany(queries: GetProductQueries): Promise<ProductDomainList> {
    const { category, cursor, discount, sellDate, status, sortQuery } = queries;
    this.checkCategoryQuery(category);
    const discountQuery = this.checkDiscountQuery(discount);
    const sellDateQuery = this.checkSellDateQuery(sellDate);
    const statusQuery = this.checkStatusQuery(status);
    return this.productRepository.findMany({
      category,
      cursor,
      discount: discountQuery,
      sellDate: sellDateQuery,
      status: statusQuery,
      paginationOption: queries?.paginationOption,
      sortQuery,
    });
  }

  private checkCategoryQuery(category: GetProductQueries['category']): void {
    if (!category) return null;
    if (!isString(category) || !isUUID(category))
      throw ErrorApiResponse.badRequest(
        `Category: ${category} is not a valid data type for query. `,
      );
  }

  private checkDiscountQuery(
    discount: GetProductQueries['discount'],
  ): GetProductQueries['discount'] {
    return EnumCheckerHelper.getEnumValueOrThrow(
      ProductDiscountQueryEnum,
      discount,
      ProductDiscountQueryEnum.ALL,
    );
  }

  private checkSellDateQuery(
    sellDate: GetProductQueries['sellDate'],
  ): GetProductQueries['sellDate'] {
    return EnumCheckerHelper.getEnumValueOrThrow(
      ProductSellDateQueryEnum,
      sellDate,
      ProductSellDateQueryEnum.NOW,
    );
  }

  private checkStatusQuery(
    status: GetProductQueries['status'],
  ): GetProductQueries['status'] {
    return EnumCheckerHelper.getEnumValueOrThrow(
      ProductStatusQueryEnum,
      status,
      ProductStatusQueryEnum.ACTIVE,
    );
  }
}
