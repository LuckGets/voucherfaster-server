import {
  TermAndCondLangauage,
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherDomainCreateInput,
  VoucherImgCreateInput,
  VoucherStatusEnum,
  VoucherTagDomain,
  VoucherTermAndCondCreateInput,
  VoucherTermAndCondDomain,
} from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';
import { PrismaService } from '../../config/prisma.service';
import { VoucherRepository, VoucherTagRepository } from '../voucher.repository';
import { Prisma, Voucher, VoucherStatus } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { VoucherMapper, VoucherTermAndCondMapper } from './voucher.mapper';
import {
  TermAndCondUpdateDto,
  UpdateVoucherDto,
} from '@resources/voucher/dto/vouchers/update-voucher.dto';
import { VoucherPromotionCreateInput } from '@resources/voucher/domain/voucher-promotion.domain';

export class VoucherRelationalPrismaORMRepository implements VoucherRepository {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    private voucherTagRepository: VoucherTagRepository,
  ) {}

  private tagAndCategoryIncludeQuery: Prisma.VoucherInclude = {
    voucherTag: {
      include: {
        voucherCategory: {
          select: {
            name: true,
          },
        },
      },
    },
  };

  private voucherJoinQuery: Prisma.VoucherInclude = {
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
        stockAmount: true,
        promotionPrice: true,
        sellStartedAt: true,
        sellExpiredAt: true,
        usableAt: true,
        usableExpiredAt: true,
      },
      where: {
        deletedAt: {
          equals: null,
        },
        sellStartedAt: {
          lte: new Date(Date.now()),
        },
        sellExpiredAt: {
          gt: new Date(Date.now()),
        },
      },
    },
    ...this.tagAndCategoryIncludeQuery,
  };

  private voucherAllDetailJoinQuery: Prisma.VoucherInclude = {
    ...this.tagAndCategoryIncludeQuery,
    VoucherImg: {
      select: {
        id: true,
        imgPath: true,
        mainImg: true,
      },
    },
    VoucherPromotion: {
      select: {
        id: true,
        name: true,
        stockAmount: true,
        promotionPrice: true,
        sellStartedAt: true,
        sellExpiredAt: true,
        usableAt: true,
        usableExpiredAt: true,
      },
      where: {
        deletedAt: {
          equals: null,
        },
        sellStartedAt: {
          lte: new Date(Date.now()),
        },
        sellExpiredAt: {
          gt: new Date(Date.now()),
        },
      },
    },
    VoucherTermAndCondEN: {
      where: {
        inactiveAt: {
          equals: null,
        },
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
  };

  private generateWhereQuery(): Prisma.VoucherWhereInput {
    const currentDate = new Date();
    return {
      AND: [
        {
          sellStartedAt: {
            lte: currentDate,
          },
          sellExpiredAt: {
            gt: currentDate,
          },
        },
      ],
    };
  }
  /**
   * We need to
   * creating a voucher
   * term and condition
   * and store the voucher-related image
   * in one transaction
   */
  async createVoucherAndTermAndImgAndPromotionTransaction({
    voucherData,
    termAndCondThArr,
    termAndCondEnArr,
    image,
    promotion,
  }: {
    voucherData: VoucherDomainCreateInput;
    termAndCondThArr: VoucherTermAndCondCreateInput[];
    termAndCondEnArr: VoucherTermAndCondCreateInput[];
    image: VoucherImgCreateInput[];
    promotion: VoucherPromotionCreateInput;
  }): Promise<VoucherDomain> {
    const { voucher, createdPromotion } = await this.prismaService.$transaction(
      async (txUnit) => {
        const voucher = await txUnit.voucher.create({
          data: voucherData,
        });

        const [, , , createdPromotion] = await Promise.all([
          txUnit.voucherTermAndCondTh.createMany({ data: termAndCondThArr }),
          txUnit.voucherTermAndCondEN.createMany({ data: termAndCondEnArr }),
          txUnit.voucherImg.createMany({ data: image }),
          promotion
            ? txUnit.voucherPromotion.create({ data: promotion })
            : null,
        ]);

        return { voucher, createdPromotion };
      },
    );
    const createdVoucher = await this.findById(voucher.id);
    return createdVoucher;
  }

  async findById(id: VoucherDomain['id']): Promise<NullAble<VoucherDomain>> {
    const voucherJoinQuery = this.voucherAllDetailJoinQuery;
    const voucher = await this.prismaService.voucher.findUnique({
      where: {
        id,
      },
      include: voucherJoinQuery,
    });
    return VoucherMapper.toDomain(voucher, { allInfo: true });
  }

  async findByIds(idList: VoucherDomain['id'][]): Promise<VoucherDomain[]> {
    const voucherJoinQuery = this.voucherAllDetailJoinQuery;
    const voucherList = await this.prismaService.voucher.findMany({
      where: {
        id: { in: idList },
      },
      include: voucherJoinQuery,
    });
    return voucherList.map((item) =>
      VoucherMapper.toDomain(item, { allInfo: false }),
    );
  }

  async findMany({
    tag,
    category,
    paginationOption,
    cursor,
    sortOption,
    status,
  }: {
    tag?: VoucherTagDomain['id'];
    category?: VoucherCategoryDomain['name'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    sortOption?: any;
    status: VoucherDomain['status'];
  }): Promise<VoucherDomain[]> {
    const paginatedQueryOptiion = generatePaginationQueryOption({
      cursor,
      paginationOption,
      sortOption,
    });

    // Prepare the variable
    // for using as prisma where query
    const whereQueryOption: Prisma.VoucherWhereInput = {
      status,
      ...this.generateWhereQuery(),
    };

    // Voucher Join query
    const voucherJoinQuery = this.voucherJoinQuery;

    // If the request provide category query
    if (category) {
      // GRAB all of related-tag list in the provided category and tag name
      const tagListFromCategories =
        await this.voucherTagRepository.findManyByCategoryNameAndTagName(
          category,
          { tagName: tag },
        );

      // Provide the in query
      // which related to tag or category name
      whereQueryOption.tagId = {
        in: tagListFromCategories.map((item) => item.id),
      };
    } else if (!category && tag) {
      whereQueryOption['where']['tagId'] = { contains: tag };
    }
    const voucherList = await this.prismaService.voucher.findMany({
      ...paginatedQueryOptiion,
      where: {
        ...whereQueryOption,
      },
      include: voucherJoinQuery,
    });
    return voucherList.map((item) =>
      VoucherMapper.toDomain(item, { allInfo: false }),
    );
  }

  async findByTitle(
    title: VoucherDomain['title'],
    status: VoucherStatus,
  ): Promise<NullAble<VoucherDomain[]>> {
    const voucherJoinQuery = this.voucherJoinQuery;
    const queryVoucherListResult = await this.prismaService.voucher.findMany({
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
        status,
        ...this.generateWhereQuery(),
      },
      include: voucherJoinQuery,
    });
    return queryVoucherListResult.map((item) =>
      VoucherMapper.toDomain(item, { allInfo: false }),
    );
  }

  async findByCategory(
    categoryName: VoucherCategoryDomain['name'],
    voucherStatus: VoucherStatusEnum = VoucherStatusEnum.ACTIVE,
    tagName?: VoucherTagDomain['name'],
  ): Promise<VoucherDomain[]> {
    const voucherJoinQuery = this.voucherJoinQuery;
    const tagListFromCategories =
      await this.voucherTagRepository.findManyByCategoryNameAndTagName(
        categoryName,
        { tagName },
      );
    const voucherQueryList = await this.prismaService.voucher.findMany({
      where: {
        tagId: {
          in: tagListFromCategories.map((item) => item.id),
        },
        status: voucherStatus,
        ...this.generateWhereQuery(),
      },
      include: voucherJoinQuery,
    });
    return voucherQueryList.map((item) =>
      VoucherMapper.toDomain(item, { allInfo: false }),
    );
  }

  async findBySearchContent(searchContent: string): Promise<VoucherDomain[]> {
    // GRAB the JOIN query
    const voucherJoinQuery = this.voucherJoinQuery;
    // Find the voucher via voucher title name first
    const queryVoucherListResult = await this.findByTitle(
      searchContent,
      VoucherStatusEnum.ACTIVE,
    );
    // If there is result in the query,
    // return the result
    if (queryVoucherListResult.length > 0) {
      return queryVoucherListResult;
    }

    // If search content does not match any
    // voucher name, let search
    // for category next
    const voucherTagList =
      await this.voucherTagRepository.findManyByCategoryNameAndTagName(
        searchContent,
        {},
      );
    const queryVoucherListViaCategoryResult =
      await this.prismaService.voucher.findMany({
        where: {
          tagId: {
            in: voucherTagList ? voucherTagList.map((item) => item.id) : [],
          },
          status: VoucherStatusEnum.ACTIVE,
          ...this.generateWhereQuery(),
        },
        include: voucherJoinQuery,
      });

    return queryVoucherListViaCategoryResult.map((item) =>
      VoucherMapper.toDomain(item, { allInfo: false }),
    );
  }

  async findManyTermAndConditionWithIds(
    termAndCondIds: VoucherTermAndCondDomain['id'][],
    lang: TermAndCondLangauage,
  ): Promise<VoucherTermAndCondDomain[]> {
    switch (lang) {
      case TermAndCondLangauage.TH:
        const termAndCond =
          await this.prismaService.voucherTermAndCondTh.findMany({
            where: {
              id: {
                in: termAndCondIds,
              },
            },
          });
        return termAndCond.map(VoucherTermAndCondMapper.toDomain);
      case TermAndCondLangauage.EN:
        const termAndCondEN =
          await this.prismaService.voucherTermAndCondEN.findMany({
            where: {
              id: {
                in: termAndCondIds,
              },
            },
          });
        return termAndCondEN.map(VoucherTermAndCondMapper.toDomain);
      default:
        return [];
    }
  }

  /**
   *
   * @param payload
   * @returns VoucherDomain
   * Service for updating voucher information in database
   */
  async update(payload: UpdateVoucherDto): Promise<VoucherDomain> {
    // Extract term and condition which need to
    // update in another table
    const { id, termAndCondEn, termAndCondTh, ...data } = payload;

    const joinQuery = this.voucherAllDetailJoinQuery;

    // Everything is wrapped in one transaction
    const voucher = await this.prismaService.$transaction(async (tx) => {
      // 1. Update Thai terms & conditions
      if (termAndCondTh && termAndCondTh.length > 0) {
        await this.upsertManyTermAndCond(tx, termAndCondTh, id, 'TH');
      }
      // 2. Update English terms & conditions
      if (termAndCondEn && termAndCondEn.length > 0) {
        await this.upsertManyTermAndCond(tx, termAndCondEn, id, 'EN');
      }
      // 3. Update the voucher record
      const voucher = await tx.voucher.update({
        data: data,
        where: { id: id },
        include: joinQuery,
      });

      return voucher; // Return the updated voucher
    });
    return VoucherMapper.toDomain(voucher, { allInfo: true });
  }

  async upsertManyTermAndCond(
    tx: Prisma.TransactionClient,
    data: TermAndCondUpdateDto[],
    voucherId: Voucher['id'],
    lang: 'TH' | 'EN',
  ): Promise<unknown> {
    const termAndCondInsertArr: Prisma.VoucherTermAndCondThCreateManyInput[] =
      [];
    const termAndCondUpdateArr: Array<{
      id: string; // primary key in your table, presumably
      data: Prisma.VoucherTermAndCondThUpdateInput;
    }> = [];

    // Process the data which can also be
    // the update or insert
    data.forEach((item) => {
      if (item.id && !item.description) {
        const { id, inactive, updatedDescription } = item;
        const data: Prisma.VoucherTermAndCondThUpdateInput = { id };
        if (inactive) {
          data.inactiveAt = new Date(Date.now());
        } else if (updatedDescription) {
          data.description = updatedDescription;
        }
        termAndCondUpdateArr.push({ id, data });
      } else {
        termAndCondInsertArr.push({ description: item.description, voucherId });
      }
    });

    if (lang === 'TH') {
      if (termAndCondInsertArr.length > 0) {
        await tx.voucherTermAndCondTh.createMany({
          data: termAndCondInsertArr,
        });
      }
      // 1. multiple updates if
      // there is the data for update
      if (termAndCondUpdateArr.length > 0) {
        for (const item of termAndCondUpdateArr) {
          await tx.voucherTermAndCondTh.update({
            where: { id: item.id },
            data: item.data,
          });
        }
      }
    } else if (lang === 'EN') {
      if (termAndCondInsertArr.length > 0) {
        await tx.voucherTermAndCondEN.createMany({
          data: termAndCondInsertArr,
        });
      }
      if (termAndCondUpdateArr.length > 0) {
        for (const item of termAndCondUpdateArr) {
          await tx.voucherTermAndCondEN.update({
            where: { id: item.id },
            data: item.data,
          });
        }
      }
    }
    return;
  }
}
