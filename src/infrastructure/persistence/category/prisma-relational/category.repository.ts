import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CategoryRepository } from '../category.repository';
import { NullAble } from '@utils/types/common.type';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { Prisma } from '@prisma/client';
import { UpdateCategoryDto } from '@resources/category/dto/category/update-category.dto';

export class CategoryRelationalPrismaORMRepository
  implements CategoryRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private nonDeleteWhereQuery: Prisma.CategoryWhereInput = {
    deletedAt: {
      equals: null,
    },
  };

  private includeTagsQuery: Prisma.CategoryInclude = {
    VoucherTags: {
      where: {
        deletedAt: null,
      },
    },
  };

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
      where: { name, ...this.nonDeleteWhereQuery },
      include: this.includeTagsQuery,
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
      where: this.nonDeleteWhereQuery,
      include: this.includeTagsQuery,
    });
  }

  async update(payload: UpdateCategoryDto): Promise<CategoryDomain> {
    return this.prismaService.category.update({
      where: {
        id: payload.id,
      },
      data: {
        name: payload.name,
      },
    });
  }

  async delete(id: CategoryDomain['id']): Promise<void> {
    await this.prismaService.category.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(Date.now()),
      },
    });
    return;
  }
}
