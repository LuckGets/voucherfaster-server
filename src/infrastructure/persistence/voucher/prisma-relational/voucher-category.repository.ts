import { Prisma } from '@prisma/client';
import { VoucherCategoryDomain } from '@resources/voucher/domain/voucher.domain';
import { VoucherCategoryMapper } from './voucher.mapper';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { PrismaService } from '../../config/prisma.service';
import { Inject } from '@nestjs/common';
import { NullAble } from '@utils/types/common.type';
import { VoucherCategoryRepository } from '../voucher.repository';

export class VoucherCategoryRelationalPrismaORMRepository
  implements VoucherCategoryRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  async findById(
    id: VoucherCategoryDomain['id'],
  ): Promise<NullAble<VoucherCategoryDomain>> {
    const voucherCategory = await this.prismaService.voucherCategory.findUnique(
      {
        where: {
          id,
        },
      },
    );
    return voucherCategory;
  }
  async findManyWithPagination({
    paginationOption,
    sortOption,
  }: {
    paginationOption?: IPaginationOption;
    sortOption?: any;
  }): Promise<VoucherCategoryDomain[]> {
    const paginationQuery = generatePaginationQueryOption<any, null>({
      paginationOption,
    });

    const categories = await this.prismaService.voucherCategory.findMany({
      ...paginationQuery,
      include: {
        VoucherTags: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
    return categories.map(VoucherCategoryMapper.toDomain);
  }

  create(
    data: Omit<VoucherCategoryDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<VoucherCategoryDomain> {
    const createdInput: Prisma.VoucherCategoryCreateInput = {
      id: data.id,
      name: data.name,
    };
    return this.prismaService.voucherCategory.create({ data: createdInput });
  }
}
