import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { CreateVoucherPromotionDto } from '@resources/voucher/dto/voucher-promotion/create-promotion.dto';
import { VoucherPromotionRepository } from '../voucher.repository';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VoucherPromotionMapper } from './voucher.mapper';
import { NullAble } from '@utils/types/common.type';
import { UpdateVoucherPromotionDto } from '@resources/voucher/dto/voucher-promotion/update-promotion.dto';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';

export class VoucherPromotionRelationalOPrismaORMRepository
  implements VoucherPromotionRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  async findById(
    id: VoucherPromotionDomain['id'],
  ): Promise<NullAble<VoucherPromotionDomain>> {
    const voucher = await this.prismaService.voucherPromotion.findUnique({
      where: { id },
    });
    return VoucherPromotionMapper.toDomain(voucher);
  }

  async findMany({
    paginationOption,
    sortOptions,
    cursor,
    name,
  }: {
    paginationOption?: IPaginationOption;
    sortOptions?: unknown;
    cursor?: VoucherPromotionDomain['id'];
    name?: VoucherPromotionDomain['name'];
  }): Promise<VoucherPromotionDomain[]> {
    const paginatedQuery = generatePaginationQueryOption({
      paginationOption,
      cursor,
    });
    const promotionQueryList =
      await this.prismaService.voucherPromotion.findMany({
        where: {
          name: {
            contains: name,
          },
          deletedAt: {
            equals: null,
          },
        },
        ...paginatedQuery,
      });

    return promotionQueryList.map((item) =>
      VoucherPromotionMapper.toDomain(item),
    );
  }

  async createPromotion(
    data: CreateVoucherPromotionDto,
  ): Promise<VoucherPromotionDomain> {
    const createdVoucherPromotion =
      await this.prismaService.voucherPromotion.create({ data });
    return VoucherPromotionMapper.toDomain(createdVoucherPromotion);
  }
  async updatePromotion(
    data: UpdateVoucherPromotionDto,
  ): Promise<VoucherPromotionDomain> {
    const { promotionId, voucherId, ...restData } = data;
    const updatedVoucherPromotion =
      await this.prismaService.voucherPromotion.update({
        data: restData,
        where: { id: promotionId },
      });
    return VoucherPromotionMapper.toDomain(updatedVoucherPromotion);
  }

  async deletePromotion(id: VoucherPromotionDomain['id']): Promise<void> {
    await this.prismaService.voucherPromotion.update({
      where: { id },
      data: { deletedAt: new Date(Date.now()) },
    });
    return;
  }
}
