import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherDomainCreateInput,
  VoucherImgCreateInput,
  VoucherTagDomain,
  VoucherTermAndCondCreateInput,
} from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';
import { IPaginationOption } from 'src/common/types/pagination.type';

export abstract class VoucherRepository {
  /**
   * As a voucher have three related table
   * So by creating a voucher actually mean
   * putting data to the four record table
   * Voucher, TH Term and condition, EN Term and condition, Voucher Image
   * so, I think we should make it as a transaction to make
   * creating voucher progress smoothly
   */
  abstract createVoucherAndTermAndImgTransaction({
    voucherData,
    termAndCondThArr,
    termAndCondEnArr,
    image,
  }: {
    voucherData: VoucherDomainCreateInput;
    termAndCondThArr: VoucherTermAndCondCreateInput[];
    termAndCondEnArr: VoucherTermAndCondCreateInput[];
    image: VoucherImgCreateInput[];
  }): Promise<{ voucher; termAndCondTh; termAndCondEn; voucherImg }>;
  abstract findById(id: VoucherDomain['id']): Promise<NullAble<void>>;
}

export abstract class VoucherCategoryRepository {
  abstract findById(
    id: VoucherCategoryDomain['id'],
  ): Promise<NullAble<VoucherCategoryDomain>>;
  abstract create(
    data: Omit<VoucherCategoryDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<VoucherCategoryDomain>;
  abstract findManyWithPagination(
    paginationOption?: IPaginationOption,
  ): Promise<any>;
}

export abstract class VoucherTagRepository {
  abstract findById(
    id: VoucherTagDomain['id'],
  ): Promise<NullAble<VoucherTagDomain>>;
  abstract create(
    data: Omit<VoucherTagDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<VoucherTagDomain>;
}
