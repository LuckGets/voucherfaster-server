import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { NullAble } from '@utils/types/common.type';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { Prisma } from '@prisma/client';
import { VoucherTagRepository } from '../voucher-tag.repository';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { isUUID } from 'class-validator';
import { VoucherTagMapper } from './voucher-tag.mapper';
import { CreateVoucherTagDto } from '@resources/category/dto/tag/create-tag.dto';
import { UpdateVoucherTagDto } from '@resources/category/dto/tag/update-tag.dto';

export class VoucherTagRelationalPrismaORMRepository
  implements VoucherTagRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private categoryIncludeQuery: Prisma.VoucherTagInclude = {
    category: true,
  };
  findById(id: VoucherTagDomain['id']): Promise<NullAble<VoucherTagDomain>> {
    return this.prismaService.voucherTag.findUnique({
      where: {
        id,
      },
      include: this.categoryIncludeQuery,
    });
  }

  async findMany({
    category,
    cursor,
    paginationOption,
    sortOption,
  }: {
    category?: CategoryDomain['name'] | CategoryDomain['id'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherTagDomain['id'];
    sortOption?: any;
  }): Promise<NullAble<VoucherTagDomain[]>> {
    const paginatedQueryOptiion = generatePaginationQueryOption({
      cursor,
      paginationOption,
      sortOption,
    });
    let categoryWhereQuery: Prisma.VoucherTagWhereInput = {};

    if (category) {
      if (isUUID(category)) {
        categoryWhereQuery = { categoryId: category };
      } else {
        categoryWhereQuery = {
          category: { name: { contains: category, mode: 'insensitive' } },
        };
      }
    }

    const voucherTagLists = await this.prismaService.voucherTag.findMany({
      ...paginatedQueryOptiion,
      where: categoryWhereQuery,
    });
    return voucherTagLists.map(VoucherTagMapper.toDomain);
  }

  async create(data: CreateVoucherTagDto): Promise<VoucherTagDomain> {
    const createdTag = await this.prismaService.voucherTag.create({
      data,
      include: this.categoryIncludeQuery,
    });

    return VoucherTagMapper.toDomain(createdTag);
  }

  async update(payload: UpdateVoucherTagDto): Promise<VoucherTagDomain> {
    const { tagId, updateCategoryId, ...restData } = payload;

    const data: Prisma.VoucherTagUpdateInput = {
      ...restData,
    };

    if (updateCategoryId) data.category.update = { id: updateCategoryId };

    const updatedTag = await this.prismaService.voucherTag.update({
      where: { id: tagId },
      data,
      include: this.categoryIncludeQuery,
    });

    return VoucherTagMapper.toDomain(updatedTag);
  }

  //   create(
  //     data: Omit<VoucherTagDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  //   ): Promise<VoucherTagDomain> {
  //     const createdInput: Prisma.VoucherTagCreateInput = {
  //       id: data.id,
  //       name: data.name,
  //       voucherCategory: { connect: { id: data.categoryId } },
  //     };
  //     return this.prismaService.voucherTag.create({ data: createdInput });
  //   }
  //   update(
  //     tagId: VoucherDomain['id'],
  //     payload:
  //       | Partial<VoucherTagDomain>
  //       | Partial<
  //           VoucherTagDomain & { updateCategoryId: VoucherCategoryDomain['id'] }
  //         >,
  //   ): Promise<VoucherTagDomain> {
  //     return this.prismaService.voucherTag.update({
  //       where: {
  //         id: tagId,
  //       },
  //       data: payload,
  //     });
  //   }
}
