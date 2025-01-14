import { VoucherUsageDaysDomain } from '@resources/voucher/domain/voucher-usage-day.domain';
import { UpdateVoucherUsageDayDto } from '@resources/voucher/dto/voucher-usage-day.dto';
import { VoucherUsageDayRepository } from '../voucher.repository';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Prisma } from '@prisma/client';

export class VoucherUsageDayRelationalPrismaORMRepository
  implements VoucherUsageDayRepository
{
  private whereQuery: Prisma.VoucherUsageDaysFindFirstArgs = {
    where: {
      deletedAt: {
        not: {
          equals: null,
        },
      },
    },
  };
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  findCurrent(): Promise<VoucherUsageDaysDomain> {
    return this.prismaService.voucherUsageDays.findFirst({
      ...this.whereQuery,
    });
  }

  async update(
    payload: UpdateVoucherUsageDayDto,
  ): Promise<VoucherUsageDaysDomain> {
    const currentVoucherUsageDays =
      await this.prismaService.voucherUsageDays.findFirst({
        ...this.whereQuery,
      });
    return this.prismaService.$transaction(async (tx) => {
      const [, newVoucherUsageDay] = await Promise.all([
        tx.voucherUsageDays.update({
          where: { id: currentVoucherUsageDays.id },
          data: { deletedAt: new Date(Date.now()) },
        }),
        tx.voucherUsageDays.create({ data: payload }),
      ]);
      return newVoucherUsageDay;
    });
  }
}
