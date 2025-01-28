import { Injectable } from '@nestjs/common';
import { CategoryRepository } from 'src/infrastructure/persistence/category/category.repository';
import { CreateCategoryDto } from './dto/category/create-category.dto';
import { CategoryDomain } from './domain/category.domain';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { UUIDService } from '@utils/services/uuid.service';
import { NullAble } from '@utils/types/common.type';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRespository: CategoryRepository,
    private uuidService: UUIDService,
  ) {}
  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER CATEGORY PART -------------------- //
  // -------------------------------------------------------------------- //

  /**
   * Create voucher category
   */
  public async create(data: CreateCategoryDto): Promise<CategoryDomain> {
    const isCategoryNameExist = await this.categoryRespository.findByName(
      data.name,
    );

    if (isCategoryNameExist)
      throw ErrorApiResponse.conflictRequest(
        `Category name ${data.name} already exist`,
      );

    return this.categoryRespository.create({
      id: String(this.uuidService.make()),
      ...data,
    });
  }

  /**
   * Service for
   * finding many
   * voucher category
   * via pagination which
   * can provide
   * cursor and page
   * to paginated
   */
  public getPaginationVoucherCategory({
    cursor,
  }: {
    cursor: CategoryDomain['id'];
  }): Promise<NullAble<CategoryDomain[]>> {
    return this.categoryRespository.findManyWithPagination({ cursor });
  }
}
