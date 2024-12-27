import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherDomainCreateInput,
  VoucherImgCreateInput,
  VoucherImgDomain,
  VoucherImgUpdateInput,
  VoucherTagDomain,
  VoucherTermAndCondCreateInput,
} from '@resources/voucher/domain/voucher.domain';
import { UpdateVoucherDto } from '@resources/voucher/dto/update-voucher.dto';
import { NullAble } from '@utils/types/common.type';
import { IPaginationOption } from 'src/common/types/pagination.type';

export abstract class VoucherRepository {
  /**
   * @abstract
   * @param voucherData VoucherDomainCreateInput;
   * @param termAndCondThArr VoucherTermAndCondCreateInput[];;
   * @param termAndCondEnArr VoucherTermAndCondCreateInput[];
   * @param image VoucherImgCreateInput[];
   * @returns VoucherDomain
   *
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
  }): Promise<VoucherDomain>;
  /**
   *
   * @param id
   * @returns VoucherDomain
   *
   * Find the voucher in database by ID which can be
   * the voucher domain or null
   */
  abstract findById(id: VoucherDomain['id']): Promise<NullAble<VoucherDomain>>;
  /**
   *
   * @param code
   * @returns {Promise<NullAble<VoucherDomain>>}
   * Find the voucher in database by code which can be
   * the voucher domain or null
   */
  abstract findByVoucherCode(
    code: VoucherDomain['code'],
  ): Promise<NullAble<VoucherDomain>>;

  /**
   *
   * @param searchContent string
   * @returns VoucherDomain[] or null
   *
   * Find the voucher in database
   * by searching content
   * which can be
   * the voucher domain list or null
   */
  abstract findBySearchContent(
    searchContent: string,
  ): Promise<NullAble<VoucherDomain[]>>;

  abstract findMany({
    tag,
    category,
    cursor,
    paginationOption,
    sortOption,
  }: {
    tag?: VoucherTagDomain['id'];
    category?: VoucherCategoryDomain['name'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    sortOption?: unknown;
  }): Promise<NullAble<VoucherDomain[]>>;

  abstract update(data: UpdateVoucherDto): Promise<VoucherDomain>;
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
  ): Promise<VoucherCategoryDomain[]>;
}

export abstract class VoucherTagRepository {
  abstract findById(
    id: VoucherTagDomain['id'],
  ): Promise<NullAble<VoucherTagDomain>>;
  abstract create(
    data: Omit<VoucherTagDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<VoucherTagDomain>;
  abstract update(
    tagId: VoucherDomain['id'],
    payload:
      | Partial<VoucherTagDomain>
      | Partial<VoucherTagDomain & { categoryId: VoucherCategoryDomain['id'] }>,
  ): Promise<VoucherTagDomain>;
}

export abstract class VoucherImgRepository {
  abstract findById(
    id: VoucherImgDomain['id'],
  ): Promise<NullAble<VoucherImgDomain>>;
  abstract findManyByVoucherId(
    voucherId: VoucherDomain['id'],
  ): Promise<NullAble<VoucherImgDomain[]>>;
  abstract updateNewMainImgVoucher({
    mainImgId,
    data,
    deleteMainImg,
  }: {
    mainImgId: VoucherImgDomain['id'];
    data: VoucherImgCreateInput;
    deleteMainImg: boolean;
  }): Promise<VoucherImgDomain>;
  abstract createMany(dataList: VoucherImgCreateInput[]): Promise<void>;
  abstract updateVoucherImg(
    id: VoucherImgDomain['id'],
    data: VoucherImgUpdateInput,
  ): Promise<VoucherImgDomain>;
}
