import { Controller, Get, Query } from '@nestjs/common';
import { ProductPath } from 'src/config/api-path';
import { ProductService } from './product.service';
import {
  GetManyProductsReponse,
  GetProductQueries,
  ProductDiscountQueryEnum,
  ProductSellDateQueryEnum,
  ProductStatusQueryEnum,
} from './dto/get-product.dto';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { QUERY_FIELD_NAME } from 'src/common/types/pagination.type';

@ApiTags(ProductPath.Name)
@Controller({ version: '1', path: ProductPath.Base })
export class ProductController {
  constructor(private productService: ProductService) {}

  // GET MANY PRODUCTS
  @ApiQuery({
    name: ProductPath.TagQuery,
    description:
      'Tag ID of the voucher to filter by. If tag query provided, no need to provide category.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: ProductPath.CategoryQuery,
    description: 'Category name of the voucher to filter by.',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: QUERY_FIELD_NAME.CURSOR,
    description: 'Cursor ID for pagination.',
    example: '01948da7-a4e9-710f-a31a-3a1fc1a810a7',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: ProductPath.StatusQuery,
    description: `Status of the voucher. If not provided, default will be ${ProductStatusQueryEnum.ACTIVE}`,
    required: false,
    enumName: 'VoucherStatusEnum',
    enum: [
      ProductStatusQueryEnum.ALL,
      ProductStatusQueryEnum.ACTIVE,
      ProductStatusQueryEnum.INACTIVE,
    ],
    default: ProductStatusQueryEnum.ACTIVE,
    type: String,
  })
  @ApiQuery({
    name: ProductPath.SellDateQuery,
    description: `Sell date of the voucher. If not provided, default will be ${ProductSellDateQueryEnum.NOW}.`,
    required: false,
    enumName: 'PaginationSellDateQueryEnum',
    enum: [
      ProductSellDateQueryEnum.ALL,
      ProductSellDateQueryEnum.EXPIRED,
      ProductSellDateQueryEnum.NOW,
    ],
    default: ProductSellDateQueryEnum.NOW,
    type: String,
  })
  @ApiQuery({
    name: ProductPath.DiscountQuery,
    description: `Query to filter discount-related voucher. If not provided, default will be ${ProductDiscountQueryEnum.ALL}.`,
    required: false,
    enumName: 'PaginationDiscountQueryEnum',
    enum: [
      ProductDiscountQueryEnum.ACTIVE,
      ProductDiscountQueryEnum.INACTIVE,
      ProductDiscountQueryEnum.NONE,
      ProductDiscountQueryEnum.ALL,
    ],
    default: ProductDiscountQueryEnum.ALL,
    type: String,
  })
  @ApiOkResponse({ type: () => GetManyProductsReponse })
  @Get()
  public async getManyProducts(
    @Query(ProductPath.CategoryQuery) category: GetProductQueries['category'],
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: GetProductQueries['cursor'],
    @Query(ProductPath.DiscountQuery) discount: GetProductQueries['discount'],
    @Query(ProductPath.SellDateQuery) sellDate: GetProductQueries['sellDate'],
    @Query(ProductPath.StatusQuery) status: GetProductQueries['status'],
    @Query(ProductPath.TagQuery) tag: GetProductQueries['tag'],
    @Query(ProductPath.SortQuery) sortQuery: GetProductQueries['sortQuery'],
    @Query(QUERY_FIELD_NAME.PAGE)
    page: GetProductQueries['paginationOption']['page'],
    @Query(QUERY_FIELD_NAME.LIMIT)
    limit: GetProductQueries['paginationOption']['limit'],
  ): Promise<GetManyProductsReponse> {
    const products = await this.productService.getMany({
      category,
      discount,
      cursor,
      sellDate,
      status,
      tag,
      paginationOption: { page, limit },
      sortQuery,
    });
    return GetManyProductsReponse.success(products, { page, limit });
  }
}
