import {
  VoucherCategoryDomain,
  VoucherDomainCreateInput,
  VoucherImgCreateInput,
  VoucherTagDomain,
  VoucherTermAndCondCreateInput,
} from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';
import { PrismaService } from '../../config/prisma.service';
import {
  VoucherCategoryRepository,
  VoucherRepository,
  VoucherTagRepository,
} from '../voucher.repository';
import { Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';

export class VoucherRelationalPrismaORMRepository implements VoucherRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  /**
   * We need to
   * creating a voucher
   * term and condition
   * and store the voucher-related image
   * in one transaction
   */
  async createVoucherAndTermAndImgTransaction({
    voucherData,
    termAndCondThArr,
    termAndCondEnArr,
    image,
  }: {
    voucherData: VoucherDomainCreateInput;
    termAndCondThArr: VoucherTermAndCondCreateInput[];
    termAndCondEnArr: VoucherTermAndCondCreateInput[];
    image: VoucherImgCreateInput[];
  }): Promise<{ voucher; termAndCondTh; termAndCondEn; voucherImg }> {
    return this.prismaService.$transaction(async (txUnit) => {
      const voucher = await txUnit.voucher.create({
        data: voucherData,
      });
      const [termAndCondTh, termAndCondEn, voucherImg] = await Promise.all([
        txUnit.voucherTermAndCondTh.createMany({ data: termAndCondThArr }),
        txUnit.voucherTermAndCondEN.createMany({ data: termAndCondEnArr }),
        txUnit.voucherImg.createMany({ data: image }),
      ]);
      return { voucher, termAndCondTh, termAndCondEn, voucherImg };
    });
  }
  async findById(): Promise<NullAble<void>> {
    return;
  }
}

export class VoucherCategoryRelationalPrismaORMRepository
  implements VoucherCategoryRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  findById(
    id: VoucherCategoryDomain['id'],
  ): Promise<NullAble<VoucherCategoryDomain>> {
    return this.prismaService.voucherCategory.findUnique({
      where: {
        id,
      },
    });
  }
  async findManyWithPagination(
    paginationOption?: IPaginationOption,
  ): Promise<any> {
    const paginationQuery = generatePaginationQueryOption<Record<string, any>>({
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
    return categories;
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
}
