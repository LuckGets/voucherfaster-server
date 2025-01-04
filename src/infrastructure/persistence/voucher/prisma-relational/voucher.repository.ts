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
import { VoucherRepository, VoucherTagRepository } from '../voucher.repository';
import { VoucherStatus } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { VoucherMapper } from './voucher.mapper';
import { UpdateVoucherDto } from '@resources/voucher/dto/update-voucher.dto';
import { VoucherPromotionCreateInput } from '@resources/voucher/domain/voucher-promotion.domain';

export class VoucherRelationalPrismaORMRepository implements VoucherRepository {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    private voucherTagRepository: VoucherTagRepository,
  ) {}

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
      // PackageVoucher: {
      //   where: {
      //     deletedAt: {
      //       not: null,
      //     },
      //     startedAt: {
      //       lte: new Date(Date.now()),
      //     },
      //     expiredAt: {
      //       gt: new Date(Date.now()),
      //     },
      //   },
      // },
    },
  };

  private voucherAllDetailJoinQuery = {
    include: {
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
    },
  };
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
    const voucher = await this.prismaService.$transaction(async (txUnit) => {
      const voucher = await txUnit.voucher.create({
        data: voucherData,
      });

      await Promise.all([
        txUnit.voucherTermAndCondTh.createMany({ data: termAndCondThArr }),
        txUnit.voucherTermAndCondEN.createMany({ data: termAndCondEnArr }),
        txUnit.voucherImg.createMany({ data: image }),
        promotion ? txUnit.voucherPromotion.create({ data: promotion }) : null,
      ]);
      return voucher;
    });
    return VoucherMapper.toDomain(voucher);
  }

  async findById(id: VoucherDomain['id']): Promise<NullAble<VoucherDomain>> {
    console.log(id);
    const voucherJoinQuery = this.voucherAllDetailJoinQuery;
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
    const voucherJoinQuery = this.voucherJoinQuery;
    const voucher = await this.prismaService.voucher.findUnique({
      where: {
        code,
      },
      ...voucherJoinQuery,
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
    sortOption?: any;
  }): Promise<VoucherDomain[]> {
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
      // GRAB all of related-tag list in the provided category and tag name
      const tagListFromCategories =
        await this.voucherTagRepository.findManyByCategoryNameAndTagName(
          category,
          { tagName: tag },
        );

      // Provide the in query
      // which related to tag or category name
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
    return voucherList.map((item) => VoucherMapper.toDomain(item));
  }

  async findByTitleOrCode(
    titleOrCode: VoucherDomain['title'],
    status: VoucherStatus,
  ): Promise<NullAble<VoucherDomain[]>> {
    const voucherJoinQuery = this.voucherJoinQuery;
    const queryVoucherListResult = await this.prismaService.voucher.findMany({
      where: {
        OR: [
          {
            code: {
              contains: titleOrCode,
              mode: 'insensitive',
            },
          },
          {
            title: {
              contains: titleOrCode,
              mode: 'insensitive',
            },
          },
        ],
        status,
      },
      ...voucherJoinQuery,
    });
    return queryVoucherListResult.map((item) => VoucherMapper.toDomain(item));
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
      },
      ...voucherJoinQuery,
    });
    return voucherQueryList.map((item) => VoucherMapper.toDomain(item));
  }

  async findBySearchContent(searchContent: string): Promise<VoucherDomain[]> {
    // GRAB the JOIN query
    const voucherJoinQuery = this.voucherJoinQuery;
    // Find the voucher via voucher title name first
    const queryVoucherListResult = await this.findByTitleOrCode(
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
        },
        ...voucherJoinQuery,
      });

    return queryVoucherListViaCategoryResult.map((item) =>
      VoucherMapper.toDomain(item),
    );
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
