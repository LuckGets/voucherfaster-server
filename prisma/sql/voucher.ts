import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import {
  PaginationSellDateQueryEnum,
  PaginationStatusQueryEnum,
} from '@resources/voucher/dto/vouchers/get-voucher.dto';
import { isUUID } from 'class-validator';
import { defaultPaginationOption } from 'src/common/types/pagination.type';

@Injectable()
export class VoucherPrismaRawQueryBuilder {
  constructor() {}
  public searchVoucherQuery({
    searchContent,
    status,
    sellDate,
    cursor,
    take,
    skip,
  }: {
    searchContent: string;
    status?: PaginationStatusQueryEnum;
    sellDate?: PaginationSellDateQueryEnum;
    cursor?: string;
    take?: number;
    skip?: number;
  }): Prisma.Sql {
    const offset =
      skip ||
      (defaultPaginationOption.page - 1) * defaultPaginationOption.limit;
    const limit = take || defaultPaginationOption.limit;

    const limitQuery = Prisma.sql`LIMIT ${limit}`;
    const offsetQuery = Prisma.sql`OFFSET ${offset}`;

    return Prisma.sql`SELECT
      v.id,
      v.title,
      v.status,
      v.description,
      v.term_and_condition as termAndCondition,
      v.price,
      v.stock_amount,
      v.tag_id as tagId,
      v.usable_at as usableAt,
      v.usage_expired_at as usableExpiredAt,
      v.sell_started_at as sellStartedAt,
      v.sell_expired_at as sellExpiredAt,
      v.created_at as createdAt,
      v.updated_at as updatedAt,
      
      -- VoucherImg JSON Array
      (
        SELECT json_agg(
          json_build_object(
            'id', vi.id,
            'imgPath', vi.img_path,
            'mainImg', vi.main_img
          )
        )
        FROM public.voucher_img vi
        WHERE vi.voucher_id = v.id
      ) AS "VoucherImg",
      
      -- VoucherDiscount JSON Object
      (
        SELECT json_build_object(
          'id', vd.id,
          'discountPrice', vd.discounted_price
        )
        FROM public.voucher_discount vd
        WHERE vd.voucher_id = v.id AND vd.status = 'ACTIVE' AND vd.deleted_at IS NULL
        LIMIT 1
      ) AS "VoucherDiscount",
      
      -- voucherTag JSON Object with nested category
      (
        SELECT json_build_object(
          'id', vt.id,
          'name', vt.name,
          'category', json_build_object(
            'id', c.id,
            'name', c.name
          )
        )
        FROM public.voucher_tag vt
        WHERE vt.id = v.tag_id AND vt.deleted_at IS NULL
        LIMIT 1
      ) AS "voucherTag"

    FROM public.voucher v

    -- Define necessary JOINs
    LEFT JOIN public.voucher_tag AS vt ON vt.id = v.tag_id
    LEFT JOIN public.category AS c ON c.id = vt.category_id

    -- Adjust your WHERE clause
    WHERE 
      (
        v.title ILIKE '%' || ${searchContent} || '%' 
      OR (vt.name ILIKE '%' || ${searchContent} || '%' AND vt.id IS NOT NULL) 
      OR (c.name ILIKE '%' || ${searchContent} || '%' AND vt.id IS NOT NULL)
      )
      ${this.cursorWhereQuery(cursor)}
      ${this.statusWhereQuery(status)}
      ${this.sellDateWhereQuery(sellDate)}

      ${limitQuery} ${offsetQuery}
      `;
  }

  public statusWhereQuery(status: PaginationStatusQueryEnum): Prisma.Sql {
    if (status)
      return Prisma.sql`AND v.status = CAST(${status} AS public."VoucherStatus")`;
    return Prisma.sql``;
  }

  public sellDateWhereQuery(sellDate: PaginationSellDateQueryEnum): Prisma.Sql {
    const currentDate = new Date();
    switch (sellDate) {
      case PaginationSellDateQueryEnum.NOW:
        return Prisma.sql`AND v.sell_started_at <= ${currentDate} AND v.sell_expired_at > ${currentDate}`;
      case PaginationSellDateQueryEnum.EXPIRED:
        return Prisma.sql`AND v.sell_expired_at <= ${currentDate}`;
      default:
        return Prisma.sql``;
    }
  }

  private cursorWhereQuery(cursor: VoucherDomain['id']): Prisma.Sql {
    if (cursor && !isUUID(cursor, 7)) return Prisma.sql`AND v.id > ${cursor}`;
    return Prisma.sql``;
  }
}
