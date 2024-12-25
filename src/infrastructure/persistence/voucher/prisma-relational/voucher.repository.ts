import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherTagDomain,
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

export class VoucherRelationalPrismaORMRepository implements VoucherRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  create(): Promise<VoucherDomain> {}
  findById(id: VoucherDomain['id']): Promise<NullAble<VoucherDomain>> {
    return this.prismaService.voucher.findUnique({ where: { id } });
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
