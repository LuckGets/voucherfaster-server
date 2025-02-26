import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import {
  defaultPaginationOption,
  IPaginationOption,
} from 'src/common/types/pagination.type';
import { AuthPath, ProductPath } from 'src/config/api-path';
import { ProductDomain, ProductDomainList } from '../domain/product.domain';
import { HTTPMethod } from 'src/common/http.type';
import { CalculatorService } from '@utils/services/calculator.service';

export enum ProductStatusQueryEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ALL = 'ALL',
}

export enum ProductDiscountQueryEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  NONE = 'NONE',
  ALL = 'ALL',
}

export enum ProductSellDateQueryEnum {
  NOW = 'NOW',
  ALL = 'ALL',
  EXPIRED = 'EXPIRED',
}

export enum ProductSortQueryEnum {
  CREATED_AT = 'createdat',
  ORDER = 'order',
  PACKAGE = 'packages',
}

export class GetProductQueries {
  cursor?: PackageVoucherDomain['id'];
  category?: CategoryDomain['name'] | CategoryDomain['id'];
  status?: ProductStatusQueryEnum;
  sellDate?: ProductSellDateQueryEnum;
  tag?: VoucherTagDomain['id'];
  discount?: ProductDiscountQueryEnum;
  paginationOption?: IPaginationOption;
  sortQuery?: string;
}

export class GetManyProductsReponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: `GET:: /${ProductPath.Base} successfully.`,
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: [
      {
        id: '0194b6e4-49d3-7399-b682-a2f68f72b9be',
        title: 'Burger with fries',
        status: 'ACTIVE',
        stockAmount: 10000,
        description: 'Juicy burgers with crispy french fries.',
        price: 300,
        usableAt: '2024-12-31T17:00:00.000Z',
        usableExpiredAt: '2025-12-25T17:00:00.000Z',
        sellStartedAt: '2024-12-25T17:00:00.000Z',
        sellExpiredAt: '2025-12-25T17:00:00.000Z',
        img: [
          {
            id: '0194b6e4-49d3-7399-b682-cc1e1db7b121',
            imgPath:
              'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp',
          },
        ],
        discount: {
          id: '0194b6e4-49d3-7399-b682-f939c52bdf91',
          discountedPrice: 199,
          createdAt: '2025-01-30T11:06:44.623Z',
          updatedAt: '2025-01-30T11:06:44.623Z',
          status: 'ACTIVE',
        },
        category: 'All-international',
        tag: 'Lunch',
      },
    ],
  })
  public data: ProductDomain[];
  @ApiProperty({
    type: String,
    description:
      "The last data's ID using in the next query to retrive the next data pages.",
  })
  public cursor: ProductDomain['id'];
  @ApiProperty({
    type: Number,
    description: 'The pagination page of the data list.',
  })
  public page: IPaginationOption['page'];
  @ApiProperty({
    type: Number,
    description: 'Total pages of all products.',
  })
  public totalPages: number;

  constructor(
    code: number,
    message: string,
    link: HATEOSLink,
    data: GetManyProductsReponse['data'],
    cursor: GetManyProductsReponse['cursor'],
    page: GetManyProductsReponse['page'],
    totalPages: GetManyProductsReponse['totalPages'],
  ) {
    super(code, message, link);

    this.data = data;
    this.cursor = cursor;
    this.page = page;
    this.totalPages = totalPages;
  }

  public static success(
    data: ProductDomainList,
    paginationOptions: IPaginationOption,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetManyProductsReponse {
    const { page, limit } = paginationOptions;
    const responseMessage =
      message ?? `${HTTPMethod.Get}:: ${ProductPath.Base} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    const nxtPageCursor =
      data.products.length > 0
        ? data.products[data.products.length - 1].id
        : null;
    const totalPages = Math.ceil(
      CalculatorService.divide(
        data.totalCount,
        limit ?? defaultPaginationOption.limit,
      ),
    );

    return new GetManyProductsReponse(
      responseCode,
      responseMessage,
      responseLink,
      data.products,
      nxtPageCursor,
      page ?? 1,
      totalPages,
    );
  }
}
