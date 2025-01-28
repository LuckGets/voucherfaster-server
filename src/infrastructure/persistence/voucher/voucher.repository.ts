import {
  VoucherDiscountCreateInput,
  VoucherDiscountDomain,
} from '@resources/voucher/domain/voucher-discount.domain';
import {
  VoucherDomain,
  VoucherImgCreateInput,
  VoucherImgDomain,
  VoucherImgUpdateInput,
} from '@resources/voucher/domain/voucher.domain';
import {
  PaginationDiscountQueryEnum,
  PaginationSellDateQueryEnum,
} from '@resources/voucher/dto/vouchers/get-voucher.dto';
import { UpdateVoucherDto } from '@resources/voucher/dto/vouchers/update-voucher.dto';
import { NullAble } from '@utils/types/common.type';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { CreateVoucherDiscountDto } from '@resources/voucher/dto/voucher-discount/create-discount.dto';
import { CreateVoucherDto } from '@resources/voucher/dto/vouchers/create-voucher.dto';

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
  abstract createVoucherAndTermAndImgAndPromotionTransaction({
    voucherData,
    image,
    voucherDiscount,
  }: {
    voucherData: CreateVoucherDto;
    image: VoucherImgCreateInput[];
    voucherDiscount?: VoucherDiscountCreateInput;
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
   * @param id Array of VoucherDomain["id"]
   * @returns VoucherDomain[]
   *
   * Find the vouchers in database with this list of ID which can
   * match or not match the existing records.
   * return only matching records.
   */
  abstract findByIds(idList: VoucherDomain['id'][]): Promise<VoucherDomain[]>;

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
    {
      sellDate,
      status,
      cursor,
    }: {
      sellDate: PaginationSellDateQueryEnum;
      status: VoucherDomain['status'];
      cursor: VoucherDomain['id'];
    },
  ): Promise<VoucherDomain[]>;

  /**
   *
   * @param tag VoucherTagDomain
   */
  abstract findMany({
    tag,
    category,
    cursor,
    paginationOption,
    sortOption,
    status,
    sellDate,
    discount,
  }: {
    tag?: VoucherTagDomain['name'];
    category?: CategoryDomain['name'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    discount?: PaginationDiscountQueryEnum;
    sortOption?: unknown;
    status?: VoucherDomain['status'];
    sellDate: PaginationSellDateQueryEnum;
  }): Promise<VoucherDomain[]>;

  abstract update(data: UpdateVoucherDto): Promise<VoucherDomain>;
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
  abstract createMany(
    dataList: VoucherImgCreateInput[],
  ): Promise<VoucherImgDomain[]>;
  abstract updateVoucherImg(
    id: VoucherImgDomain['id'],
    data: VoucherImgUpdateInput,
  ): Promise<VoucherImgDomain>;

  abstract deleteById(id: VoucherImgDomain['id']): Promise<void>;
}

export abstract class VoucherDiscountRepository {
  abstract create(data: CreateVoucherDiscountDto): Promise<VoucherDomain>;

  // abstract update(data: UpdateVoucherDiscountDto): Promise<VoucherDomain>;

  abstract delete(id: VoucherDiscountDomain['id']): Promise<void>;
}
