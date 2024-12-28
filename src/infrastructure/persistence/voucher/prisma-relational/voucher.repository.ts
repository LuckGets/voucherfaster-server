import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherDomainCreateInput,
  VoucherImgCreateInput,
  VoucherImgDomain,
  VoucherImgUpdateInput,
  VoucherStatusEnum,
  VoucherTagDomain,
  VoucherTermAndCondCreateInput,
} from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';
import { PrismaService } from '../../config/prisma.service';
import {
  VoucherCategoryRepository,
  VoucherImgRepository,
  VoucherRepository,
  VoucherTagRepository,
} from '../voucher.repository';
import { Prisma, VoucherStatus } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { VoucherCategoryMapper, VoucherMapper } from './voucher.mapper';
import { UpdateVoucherDto } from '@resources/voucher/dto/update-voucher.dto';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';

export class VoucherRelationalPrismaORMRepository implements VoucherRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private voucherJoinQuery = {
    include: {
      VoucherImg: {
        where: {
          mainImg: true,
        },
        select: {
          id: true,
          imgPath: true,
        },
      },
      VoucherPromotion: {
        select: {
          id: true,
          name: true,
          promotionPrice: true,
          sellStartedAt: true,
          sellExpiredAt: true,
          usableAt: true,
          usableExpiredAt: true,
        },
        where: {
          deletedAt: {
            not: null,
          },
          sellStartedAt: {
            lte: new Date(Date.now()),
          },
          sellExpiredAt: {
            gt: new Date(Date.now()),
          },
        },
      },
      PackageVoucher: {
        where: {
          deletedAt: {
            not: null,
          },
          startedAt: {
            lte: new Date(Date.now()),
          },
          expiredAt: {
            gt: new Date(Date.now()),
          },
        },
      },
    },
  };
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
    const voucher = await this.prismaService.$transaction(async (txUnit) => {
      const voucher = await txUnit.voucher.create({
        data: voucherData,
      });
      await Promise.all([
        txUnit.voucherTermAndCondTh.createMany({ data: termAndCondThArr }),
        txUnit.voucherTermAndCondEN.createMany({ data: termAndCondEnArr }),
        txUnit.voucherImg.createMany({ data: image }),
      ]);
      return voucher;
    });
    return VoucherMapper.toDomain(voucher);
  }

  async findById(id: VoucherDomain['id']): Promise<NullAble<VoucherDomain>> {
    const voucherJoinQuery = this.voucherJoinQuery;
    const voucher = await this.prismaService.voucher.findUnique({
      where: {
        id,
      },
      ...voucherJoinQuery,
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
        VoucherTermAndCondEN: {
          where: {
            inactiveAt: {
              equals: null,
            },
          },
          select: {
            id: true,
            description: true,
          },
        },
        VoucherTermAndCondTh: {
          where: {
            inactiveAt: {
              equals: null,
            },
          },
          select: {
            id: true,
            description: true,
          },
        },
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

    // Prepare the variable
    // for using as prisma where query
    const whereQueryOption = {
      where: {
        status: VoucherStatusEnum.ACTIVE,
      },
    };

    // Voucher Join query
    const voucherJoinQuery = this.voucherJoinQuery;

    // If the request provide category query
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
      whereQueryOption.where['tagId'] = {
        in: tagListFromCategories.map((item) => item.id),
      };
    } else if (!category && tag) {
      whereQueryOption['where']['tagId'] = { contains: tag };
    }
    const voucherList = await this.prismaService.voucher.findMany({
      ...paginatedQueryOptiion,
      ...whereQueryOption,
      ...voucherJoinQuery,
    });
    return voucherList.map(VoucherMapper.toDomain);
  }

  async findByTitle(title: VoucherDomain['title'], status: VoucherStatus) {
    const voucherJoinQuery = this.voucherJoinQuery;
    const queryVoucherListResult = await this.prismaService.voucher.findMany({
      where: {
        OR: [
          {
            // code: {
            //   startsWith: searchContent,
            //   mode: 'insensitive',
            // },
            title: {
              contains: title,
              mode: 'insensitive',
            },
          },
        ],
        status,
      },
      ...voucherJoinQuery,
    });
    return VoucherMapper.separateVoucherAndPackageToDomain(
      queryVoucherListResult,
    );
  }

  async findByCategory(categoryName: VoucherCategoryDomain['name']) {}

  async findBySearchContent(searchContent: string): Promise<{
    voucher: NullAble<VoucherDomain[]>;
    package: NullAble<VoucherPromotionDomain[]>;
  }> {
    const voucherJoinQuery = this.voucherJoinQuery;
    const queryVoucherListResult = await this.findByTitle(
      searchContent,
      VoucherStatusEnum.ACTIVE,
    );
    // If there is result in the query,
    // return the result
    if (queryVoucherListResult.voucher.length > 0) {
      return queryVoucherListResult;
    }
    const voucherTagList = await this.prismaService.voucherCategory
      .findFirst({
        where: {
          name: {
            contains: searchContent,
          },
        },
      })
      .VoucherTags({
        select: {
          id: true,
        },
      });
    const queryVoucherListViaCategoryResult =
      VoucherMapper.separateVoucherAndPackageToDomain(
        await this.prismaService.voucher.findMany({
          where: {
            tagId: {
              in: voucherTagList.map((item) => item.id),
            },
            status: 'ACTIVE',
          },
          ...voucherJoinQuery,
        }),
      );

    return queryVoucherListViaCategoryResult;
  }

  /**
   *
   * @param payload
   * @returns VoucherDomain
   * Service for updating voucher information in database
   */
  async update(payload: UpdateVoucherDto): Promise<VoucherDomain> {
    const { id, ...data } = payload;
    const voucher = await this.prismaService.voucher.update({
      data: data,
      where: {
        id: id,
      },
    });
    return VoucherMapper.toDomain(voucher);
  }
}

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
  async findManyWithPagination(
    paginationOption?: IPaginationOption,
  ): Promise<VoucherCategoryDomain[]> {
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

export class VoucherImgRelationalPrismaORMRepository
  implements VoucherImgRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  findById(id: VoucherImgDomain['id']): Promise<NullAble<VoucherImgDomain>> {
    return this.prismaService.voucherImg.findUnique({
      where: {
        id,
      },
    });
  }
  findManyByVoucherId(
    voucherId: VoucherDomain['id'],
  ): Promise<NullAble<VoucherImgDomain[]>> {
    return;
  }
  updateNewMainImgVoucher({
    mainImgId,
    data,
    deleteMainImg,
  }: {
    mainImgId: VoucherImgDomain['id'];
    data: VoucherImgCreateInput;
    deleteMainImg: boolean;
  }): Promise<VoucherImgDomain> {
    return this.prismaService.$transaction(async (txUnit) => {
      // Update the main image to non-main image
      const mainImgAction = deleteMainImg
        ? txUnit.voucherImg.delete({
            where: {
              id: mainImgId,
            },
          })
        : txUnit.voucherImg.update({
            where: {
              id: mainImgId,
            },
            data: {
              mainImg: false,
            },
          });

      const [, newVoucherImg] = await Promise.all([
        mainImgAction,
        txUnit.voucherImg.create({
          data,
        }),
      ]);
      return newVoucherImg;
    });
  }
  updateVoucherImg(
    id: VoucherImgDomain['id'],
    payload: VoucherImgUpdateInput,
  ): Promise<NullAble<VoucherImgDomain>> {
    return;
  }
  async createMany(dataList: VoucherImgCreateInput[]): Promise<void> {
    await this.prismaService.voucherImg.createMany({ data: dataList });
    return;
  }
}
