import { Prisma } from '@prisma/client';
import { UsableDaysAfterPurchasedRepository } from '../usable-days.repository';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UsableDaysAfterPurchasedDomain } from '@resources/usable-days/domain/usable-day.domain';
import { UpdateUsableDaysAfterPurchasedDayDto } from '@resources/usable-days/dto/update-usable-day.dto';

export class UsableDaysRelationalPrismaORMRepository
  implements UsableDaysAfterPurchasedRepository
{
  private whereQuery: Prisma.UsableDaysAfterPurchasedFindFirstArgs = {
    where: {
      deletedAt: {
        equals: null,
      },
    },
  };
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  findManyAvailable(): Promise<UsableDaysAfterPurchasedDomain[]> {
    return this.prismaService.usableDaysAfterPurchased.findMany({
      ...this.whereQuery,
    });
  }

  async update(
    payload: UpdateUsableDaysAfterPurchasedDayDto,
  ): Promise<UsableDaysAfterPurchasedDomain> {
    const currentVoucherUsageDays =
      await this.prismaService.usableDaysAfterPurchased.findFirst({
        ...this.whereQuery,
      });
    return this.prismaService.$transaction(async (tx) => {
      const [, newVoucherUsageDay] = await Promise.all([
        tx.usableDaysAfterPurchased.update({
          where: { id: currentVoucherUsageDays.id },
          data: { deletedAt: new Date(Date.now()) },
        }),
        tx.usableDaysAfterPurchased.create({ data: payload }),
      ]);
      return newVoucherUsageDay;
    });
  }
}
