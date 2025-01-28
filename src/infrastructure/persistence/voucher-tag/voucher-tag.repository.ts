import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { CreateVoucherTagDto } from '@resources/category/dto/tag/create-tag.dto';
import { UpdateVoucherTagDto } from '@resources/category/dto/tag/update-tag.dto';
import { NullAble } from '@utils/types/common.type';
import { IPaginationOption } from 'src/common/types/pagination.type';

export abstract class VoucherTagRepository {
  abstract findById(
    id: VoucherTagDomain['id'],
  ): Promise<NullAble<VoucherTagDomain>>;

  /**
   *
   * @param param
   * @returns List of Voucher tag
   *
   * Service for finding many voucher tag list.
   *
   * If none information provided, the returned
   * voucher tag list
   * will be sequential
   */
  abstract findMany({
    category,
    cursor,
    paginationOption,
    sortOption,
  }: {
    category?: CategoryDomain['name'] | CategoryDomain['id'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherTagDomain['id'];
    sortOption?: unknown;
  }): Promise<NullAble<VoucherTagDomain[]>>;

  abstract create(payload: CreateVoucherTagDto): Promise<VoucherTagDomain>;
  abstract update(payload: UpdateVoucherTagDto): Promise<VoucherTagDomain>;
}
