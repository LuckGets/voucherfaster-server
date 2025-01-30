import { Injectable } from '@nestjs/common';
import { CategoryRepository } from 'src/infrastructure/persistence/category/category.repository';
import { CreateCategoryDto } from './dto/category/create-category.dto';
import { CategoryDomain } from './domain/category.domain';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { UUIDService } from '@utils/services/uuid.service';
import { NullAble } from '@utils/types/common.type';
import { UpdateCategoryDto } from './dto/category/update-category.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRespository: CategoryRepository,
    private readonly uuidService: UUIDService,
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

  public update(payload: UpdateCategoryDto): Promise<CategoryDomain> {
    const isCategoryExist = this.categoryRespository.findById(payload.id);

    if (!isCategoryExist)
      throw ErrorApiResponse.notFoundRequest(
        `The voucher category ID: ${payload.id} could not be found on this server.`,
      );

    return this.categoryRespository.update(payload);
  }

  public getById(id: CategoryDomain['id']): Promise<CategoryDomain> {
    if (!id || !isUUID(id, 7))
      throw ErrorApiResponse.badRequest(`Invalid ID format.`);

    return this.categoryRespository.findById(id);
  }

  public async delete(id: CategoryDomain['id']): Promise<void> {
    if (!id || !isUUID(id, 7))
      throw ErrorApiResponse.badRequest(`Invalid ID format.`);

    const isCategoryExist = await this.categoryRespository.findById(id);
    if (!isCategoryExist)
      throw ErrorApiResponse.notFoundRequest(
        `The voucher category ID: ${id} could not be found on this server.`,
      );

    return this.categoryRespository.delete(id);
  }
}
