import { Injectable } from '@nestjs/common';
import { Category, Prisma, VoucherTag } from '@prisma/client';
import { ProductDiscountStatusEnum } from '@resources/product/domain/product.domain';
import {
  GetProductQueries,
  ProductDiscountQueryEnum,
  ProductSortQueryEnum,
} from '@resources/product/dto/get-product.dto';
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';
import { NullAble } from '@utils/types/common.type';
import { ErrorApiResponse } from 'src/common/core-api-response';
import {
  defaultPaginationOption,
  IPaginationOption,
} from 'src/common/types/pagination.type';
import { ProductCountRowName } from 'src/infrastructure/persistence/product/prisma-relational/product.mapper';

@Injectable()
export class ProductPrismaSQLRepository {
  private sortFieldMapToDbCol: {
    [ProductSortQueryEnum.CREATED_AT]: 'created_at';
    [ProductSortQueryEnum.ORDER]: 'order';
    [ProductSortQueryEnum.PACKAGE]: 'package_voucher';
  } = {
    [ProductSortQueryEnum.CREATED_AT]: 'created_at',
    [ProductSortQueryEnum.ORDER]: 'order',
    [ProductSortQueryEnum.PACKAGE]: 'package_voucher',
  };

  private sortProductColumn = 'product_order';

  private mutateColProductForOrdering(value: number, colArr: string[]): void {
    if (typeof value !== 'number') return;

    colArr.push(`${value} AS ${this.sortProductColumn}`);
    return;
  }

  private voucherBaseQuery(orderToSort: number): Prisma.Sql {
    const columns = [
      'v.id',
      'v.title',
      'v.description',
      'v.price',
      'v.status',
      'v.stock_amount',
      'v.usable_at',
      'v.usable_expired_at',
      'v.sell_started_at',
      'v.sell_expired_at',
      'v.created_at',
      'v.updated_at',
      'vi.id AS image_id',
      'vi.img_path',
      'vi.main_img',
      'vd.id AS discount_id',
      'vd.discounted_price',
      'vd.status AS discount_status',
      'vt.name AS tag_name',
      'c.name AS category_name',
      'NULL AS package_quota_voucher_id',
      'NULL AS quota_voucher_id',
      'NULL AS quota_amount',
    ];

    this.mutateColProductForOrdering(orderToSort, columns);
    return Prisma.sql`SELECT
${Prisma.raw(columns.join(', '))}
FROM voucher AS v
LEFT JOIN voucher_img AS vi ON v.id  = vi.voucher_id `;
  }

  private packageBaseQuery(orderToSort: number): Prisma.Sql {
    const columns = [
      'p.id',
      'p.title',
      'p.description',
      'p.price',
      'p.status',
      'p.stock_amount',
      'p.usable_at',
      'p.usable_expired_at',
      'p.sell_started_at',
      'p.sell_expired_at',
      'p.created_at',
      'p.updated_at',
      'pi.id AS image_id',
      'pi.img_path',
      'pi.main_img',
      'pd.id AS discount_id',
      'pd.discounted_price',
      'pd.status AS discount_status',
      'vt.name AS tag_name',
      'c.name AS category_name',
      'pq.id AS package_quota_voucher_id',
      'pq.quota_voucher_id AS quota_voucher_id',
      'pq.amount AS quota_amount',
    ];

    this.mutateColProductForOrdering(orderToSort, columns);

    return Prisma.sql`
SELECT  ${Prisma.raw(columns.join(', '))}
FROM package_voucher AS p
LEFT JOIN package_img AS pi 
  ON p.id = pi.package_id AND pi.main_img = true
LEFT JOIN package_quota_voucher AS pq 
  ON p.id = pq.package_id AND pq.deleted_at IS NULL`;
  }

  public getManyproducts(queries: GetProductQueries): {
    product: Prisma.Sql;
    count: Prisma.Sql;
  } {
    const {
      category,
      discount,
      paginationOption,
      sellDate,
      status,
      tag,
      sortQuery,
    } = queries;

    const isSortWithPackage =
      !!sortQuery && sortQuery.includes(ProductSortQueryEnum.PACKAGE);

    let packageOrder: NullAble<number> = null;
    let voucherOrder: NullAble<number> = null;

    if (isSortWithPackage) {
      packageOrder = 1;
      voucherOrder = 2;
    }

    const voucherQueries = Prisma.sql`
  ${this.voucherBaseQuery(voucherOrder)}
  ${this.categoryQueryBuilder('voucher', category, tag)}
  ${this.discountQueryBuilder('voucher', discount)}
  `;

    const packageQueries = Prisma.sql`
  ${this.packageBaseQuery(packageOrder)}
  ${this.categoryQueryBuilder('package', category, tag)}
  ${this.discountQueryBuilder('package', discount)}
  `;

    const productQueries: Prisma.Sql = Prisma.sql`${voucherQueries} UNION ALL ${packageQueries}`;

    const paginationQuery = this.paginationQueryBuilder(paginationOption);

    const orderByQuery = this.orderByQueryBuilder(sortQuery);

    const count = Prisma.sql`
     SELECT COUNT(*) AS ${Prisma.raw(ProductCountRowName)}
    FROM (
      ${productQueries}
    ) AS combined
  `;

    return {
      product: Prisma.sql`
${productQueries}
 ${orderByQuery}
 ${paginationQuery}
 `,
      count,
    };
  }

  private categoryQueryBuilder(
    productType: 'voucher' | 'package',
    categoryId: Category['id'],
    tagId?: VoucherTag['id'],
  ): Prisma.Sql {
    const alias = productType === 'voucher' ? 'v' : 'p';
    return Prisma.sql`
  JOIN voucher_tag AS vt
    ON ${Prisma.raw(alias)}.tag_id = vt.id
    ${tagId ? Prisma.sql`AND vt.id = ${tagId}` : Prisma.empty}
  JOIN category AS c
    ON c.id = vt.category_id
    ${categoryId ? Prisma.sql`AND vt.category_id = ${categoryId}` : Prisma.empty}
`;
  }

  private discountQueryBuilder(
    productType: 'voucher' | 'package',
    discount: ProductDiscountQueryEnum,
  ) {
    const alias = productType === 'voucher' ? 'v' : 'p';
    const productDiscountAcronym = `${alias}d`;
    let baseQuery = `LEFT JOIN ${productType}_discount AS ${productDiscountAcronym} ON ${alias}.id = ${productDiscountAcronym}.${productType}_id`;
    let discountedProductQuery = `${baseQuery} AND ${alias}.deleted_at IS NULL`;
    switch (discount) {
      case ProductDiscountQueryEnum.ACTIVE:
        return Prisma.sql`${Prisma.raw(discountedProductQuery)} AND ${Prisma.raw(productDiscountAcronym)}.status = ${ProductDiscountStatusEnum.ACTIVE}`;
      case ProductDiscountQueryEnum.INACTIVE:
        return Prisma.sql`${Prisma.raw(discountedProductQuery)} AND ${Prisma.raw(productDiscountAcronym)}.status = ${ProductDiscountStatusEnum.INACTIVE}`;
      case ProductDiscountQueryEnum.NONE:
        return Prisma.sql`${Prisma.raw(baseQuery)} AND ${productDiscountAcronym}.id IS NULL`;
      default:
        return Prisma.sql`${Prisma.raw(baseQuery)}`;
    }
  }
  private orderByQueryBuilder(sortOptions: GetProductQueries['sortQuery']) {
    if (!sortOptions) return Prisma.sql`ORDER BY created_at DESC`;

    let queries: string[] = [];

    sortOptions.split(',').forEach((query) => {
      // Default to "createdat asc" if nothing is provided
      const [rawKey, rawDirection] = query.split(':'); // ["name", "asc"]
      if (!EnumCheckerHelper.checkEnumValue(ProductSortQueryEnum, rawKey))
        throw ErrorApiResponse.badRequest(`Invalid sort key: ${rawKey}`);

      switch (rawKey) {
        case ProductSortQueryEnum.CREATED_AT:
          const createdCol =
            this.sortFieldMapToDbCol[ProductSortQueryEnum.CREATED_AT];
          queries.push(`${createdCol} ${rawDirection}`);
          break;
        case ProductSortQueryEnum.PACKAGE:
          queries.push(`${this.sortProductColumn} ${rawDirection}`);
      }
    });
    const sqlOrderBy =
      queries.length > 0
        ? `ORDER BY ${queries.join(', ')}`
        : `ORDER BY created_at DESC`;
    return Prisma.sql`${Prisma.raw(sqlOrderBy)}`;
  }

  private paginationQueryBuilder(paginationOption: IPaginationOption) {
    let pageQuery = paginationOption?.page;
    let limitQuery = paginationOption?.limit;
    if (!pageQuery) pageQuery = defaultPaginationOption.page;
    if (!limitQuery) limitQuery = defaultPaginationOption.limit;
    return Prisma.sql`LIMIT ${limitQuery} OFFSET ${(pageQuery - 1) * limitQuery}`;
  }
}
