import { CategoryDomain } from '@resources/category/domain/category.domain';
import { UpdateCategoryDto } from '@resources/category/dto/category/update-category.dto';
import { NullAble } from '@utils/types/common.type';
import { IPaginationOption } from 'src/common/types/pagination.type';

export abstract class CategoryRepository {
  abstract create(
    data: Omit<CategoryDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<CategoryDomain>;

  abstract findById(
    id: CategoryDomain['id'],
  ): Promise<NullAble<CategoryDomain>>;

  abstract findByName(
    name: CategoryDomain['name'],
  ): Promise<NullAble<CategoryDomain>>;

  abstract findManyWithPagination({
    paginationOption,
    sortOption,
    cursor,
  }: {
    paginationOption?: IPaginationOption;
    sortOption?: any;
    cursor?: CategoryDomain['id'];
  }): Promise<CategoryDomain[]>;

  abstract update(payload: UpdateCategoryDto): Promise<CategoryDomain>;

  abstract delete(id: CategoryDomain['id']): Promise<void>;
}
