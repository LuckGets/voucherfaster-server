import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherDomainCreateInput,
  VoucherImgCreateInput,
  VoucherStatusEnum,
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
import { VoucherMapper } from './voucher.mapper';

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
  }): Promise<VoucherDomain> {
    console.log('Voucher input', voucherData);
    const voucher = await this.prismaService.$transaction(async (txUnit) => {
      const voucher = await txUnit.voucher.create({
        data: voucherData,
      });
      await Promise.all([
        txUnit.voucherTermAndCondTh.createMany({ data: termAndCondThArr }),
        txUnit.voucherTermAndCondEN.createMany({ data: termAndCondEnArr }),
        txUnit.voucherImg.createMany({ data: image }),
      ]);
      console.log('voucher', voucher);
      return voucher;
    });
    return VoucherMapper.toDomain(voucher);
  }
  async findById(id: VoucherDomain['id']): Promise<NullAble<VoucherDomain>> {
    const voucher = await this.prismaService.voucher.findUnique({
      where: {
        id,
      },
    });
    return voucher ? VoucherMapper.toDomain(voucher) : null;
  }
  async findByVoucherCode(
    code: VoucherDomain['code'],
  ): Promise<NullAble<VoucherDomain>> {
    const voucher = await this.prismaService.voucher.findUnique({
      where: {
        code,
      },
    });
    return voucher ? VoucherMapper.toDomain(voucher) : null;
  }

  async findMany({
    tag,
    category,
    paginationOption,
    cursor,
    sortOption,
  }: {
    tag?: VoucherTagDomain['id'];
    category?: VoucherCategoryDomain['name'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    sortOption?: unknown;
  }): Promise<NullAble<VoucherDomain[]>> {
    let tagListFromCategories: NullAble<{ id: VoucherTagDomain['id'] }[]>;
    const paginatedQueryOptiion = generatePaginationQueryOption({
      cursor,
      paginationOption,
      sortOption,
    });
    const whereQueryOption = {
      where: {
        status: VoucherStatusEnum.ACTIVE,
      },
    };
    if (category) {
      const tagWhereOption = {};
      if (tag) {
        tagWhereOption['where'] = {
          name: {
            contains: tag,
          },
        };
      }
      tagListFromCategories = await this.prismaService.voucherCategory
        .findFirst({
          where: {
            name: {
              contains: category,
            },
          },
        })
        .VoucherTags({
          select: {
            id: true,
          },
          ...tagWhereOption,
        });
      console.log('Voucher list via Catego', tagListFromCategories);
      whereQueryOption.where['tagId'] = {
        in: tagListFromCategories.map((item) => item.id),
      };
      console.log(whereQueryOption);
    } else if (!category && tag) {
      whereQueryOption['where']['tagId'] = { contains: tag };
    }
    const voucherList = await this.prismaService.voucher.findMany({
      ...paginatedQueryOptiion,
      ...whereQueryOption,
      include: {
        VoucherImg: {
          where: {
            mainImg: {
              equals: true,
            },
          },
          select: {
            id: true,
            imgPath: true,
            mainImg: true,
          },
        },
        VoucherPromotion: {
          where: {
            AND: {
              sellStartedAt: {
                lte: new Date(Date.now()),
              },
              sellExpiredAt: {
                gt: new Date(Date.now()),
              },
              deletedAt: {
                equals: null,
              },
            },
          },
        },
      },
    });
    console.log('Voucher List', voucherList);
    return voucherList.map(VoucherMapper.toDomain);
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
  ): Promise<(VoucherCategoryDomain & { VoucherTags: VoucherTagDomain[] })[]> {
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
