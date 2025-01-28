import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CategoryRepository } from '../category.repository';
import { NullAble } from '@utils/types/common.type';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { Prisma } from '@prisma/client';

export class CategoryRelationalPrismaORMRepository
  implements CategoryRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  create(
    data: Omit<CategoryDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<CategoryDomain> {
    const createdInput: Prisma.CategoryCreateInput = {
      id: data.id,
      name: data.name,
    };
    return this.prismaService.category.create({ data: createdInput });
  }
  async findById(id: CategoryDomain['id']): Promise<NullAble<CategoryDomain>> {
    return this.prismaService.category.findUnique({
      where: {
        id,
      },
    });
  }

  findByName(name: CategoryDomain['name']): Promise<NullAble<CategoryDomain>> {
    return this.prismaService.category.findFirst({
      where: { name },
    });
  }

  async findManyWithPagination({
    paginationOption,
    sortOption,
    cursor,
  }: {
    paginationOption?: IPaginationOption;
    sortOption?: any;
    cursor?: CategoryDomain['id'];
  }): Promise<CategoryDomain[]> {
    const paginationQuery = generatePaginationQueryOption({
      paginationOption,
      cursor,
    });

    return this.prismaService.category.findMany({
      ...paginationQuery,
      include: {
        VoucherTags: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }
}
