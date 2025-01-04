import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VoucherTagRepository } from '../voucher.repository';
import { NullAble } from '@utils/types/common.type';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherTagDomain,
} from '@resources/voucher/domain/voucher.domain';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { Prisma } from '@prisma/client';

export class VoucherTagRelationalPrismaORMRepository
  implements VoucherTagRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  findById(id: VoucherTagDomain['id']): Promise<NullAble<VoucherTagDomain>> {
    return this.prismaService.voucherTag.findUnique({
      where: {
        id,
      },
    });
  }

  findMany({
    category,
    cursor,
    paginationOption,
    sortOption,
  }: {
    category?: VoucherCategoryDomain['name'] | VoucherCategoryDomain['id'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    sortOption?: any;
  }): Promise<NullAble<VoucherTagDomain[]>> {
    const paginatedQueryOptiion = generatePaginationQueryOption({
      cursor,
      paginationOption,
      sortOption,
    });
    if (category)
      return this.findManyByCategoryNameAndTagName(category, { cursor });
    return this.prismaService.voucherTag.findMany({ ...paginatedQueryOptiion });
  }

  async findManyByCategoryNameAndTagName(
    categoryName: VoucherCategoryDomain['name'],
    {
      tagName,
      cursor,
    }: {
      tagName?: VoucherTagDomain['name'];
      cursor?: VoucherTagDomain['id'];
    } = {},
  ): Promise<NullAble<VoucherTagDomain[]>> {
    // If provided query contains cursor
    // for finding next one
    const paginatedQueryOptiion = generatePaginationQueryOption({ cursor });

    const tagWhereOption = {};
    // If provided query contains tag name
    if (tagName) {
      tagWhereOption['where'] = {
        name: {
          contains: tagName,
        },
      };
    }

    return this.prismaService.voucherCategory
      .findFirst({
        where: {
          name: {
            contains: categoryName,
          },
        },
      })
      .VoucherTags({
        ...tagWhereOption,
        ...paginatedQueryOptiion,
      });
  }

  create(
    data: Omit<VoucherTagDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<VoucherTagDomain> {
    const createdInput: Prisma.VoucherTagCreateInput = {
      id: data.id,
      name: data.name,
      voucherCategory: { connect: { id: data.categoryId } },
    };
    return this.prismaService.voucherTag.create({ data: createdInput });
  }
  update(
    tagId: VoucherDomain['id'],
    payload:
      | Partial<VoucherTagDomain>
      | Partial<
          VoucherTagDomain & { updateCategoryId: VoucherCategoryDomain['id'] }
        >,
  ): Promise<VoucherTagDomain> {
    return this.prismaService.voucherTag.update({
      where: {
        id: tagId,
      },
      data: payload,
    });
  }
}
