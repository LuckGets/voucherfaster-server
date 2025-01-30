import { Injectable } from '@nestjs/common';
import { VoucherTagRepository } from 'src/infrastructure/persistence/voucher-tag/voucher-tag.repository';
import { CreateVoucherTagDto } from '../dto/tag/create-tag.dto';
import { VoucherTagDomain } from '../domain/tag.domain';
import { CategoryRepository } from 'src/infrastructure/persistence/category/category.repository';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { UUIDService } from '@utils/services/uuid.service';
import { CategoryDomain } from '../domain/category.domain';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { isUUID } from 'class-validator';
import { UpdateVoucherTagDto } from '../dto/tag/update-tag.dto';

@Injectable()
export class VoucherTagService {
  constructor(
    private readonly voucherTagRepository: VoucherTagRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly uuidService: UUIDService,
  ) {}
  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER TAG PART ------------------------- //
  // -------------------------------------------------------------------- //

  /**
   * Service for create voucher tag.
   *
   */
  public async createVoucherTag(
    data: CreateVoucherTagDto,
  ): Promise<VoucherTagDomain> {
    const voucherCategory = await this.categoryRepository.findById(
      data.categoryId,
    );

    if (!voucherCategory) {
      throw ErrorApiResponse.notFoundRequest(
        'The category ID you request could not be found on this server.',
      );
    }

    const { voucherTags } = voucherCategory;

    if (voucherTags && voucherTags.length > 0) {
      const isTagNameDuplicate = voucherTags.filter(
        (tag) => tag.name === data.name,
      );
      if (isTagNameDuplicate.length > 0) {
        throw ErrorApiResponse.conflictRequest(
          `The tag name: ${data.name} already exist in this category ID: ${data.categoryId}.`,
        );
      }
    }

    return this.voucherTagRepository.create({
      ...data,
      id: String(this.uuidService.make()),
    });
  }

  public async getPaginationVoucherTag({
    category,
    cursor,
    paginationOption,
    sortOption,
  }: {
    category?: CategoryDomain['name'] | CategoryDomain['id'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherTagDomain['id'];
    sortOption?: unknown;
  }) {
    if (cursor && !isUUID(cursor, 7))
      throw ErrorApiResponse.badRequest(`Invalid cursor.`);

    return this.voucherTagRepository.findMany({
      category,
      cursor,
      paginationOption,
      sortOption,
    });
  }

  public async findById(id: VoucherTagDomain['id']): Promise<VoucherTagDomain> {
    if (!isUUID(id, 7)) throw ErrorApiResponse.badRequest(`Invalid ID.`);

    return this.voucherTagRepository.findById(id);
  }

  public async updateVoucherTag(
    data: UpdateVoucherTagDto,
  ): Promise<VoucherTagDomain> {
    const isVoucherTagExist: VoucherTagDomain =
      await this.voucherTagRepository.findById(data.tagId);

    if (!isVoucherTagExist)
      throw ErrorApiResponse.notFoundRequest(
        `The tag ID: ${data.tagId} could not be found on this server.`,
      );

    if (data.name && data.name === isVoucherTagExist.name) {
      throw ErrorApiResponse.conflictRequest(
        `The tag name: ${data.name} already the same. name: ${isVoucherTagExist.name}.`,
      );
    }

    if (data.updateCategoryId) {
      const isCategoryExist: CategoryDomain =
        await this.categoryRepository.findById(data.updateCategoryId);

      if (!isCategoryExist)
        throw ErrorApiResponse.notFoundRequest(
          `The voucher category ID: ${data.updateCategoryId} could not be found on this server.`,
        );
    }
    return this.voucherTagRepository.update(data);
  }
}
