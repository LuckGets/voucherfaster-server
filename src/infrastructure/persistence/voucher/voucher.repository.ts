import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import {
  VoucherPromotionCreateInput,
  VoucherPromotionDomain,
} from '@resources/voucher/domain/voucher-promotion.domain';
import { VoucherUsageDaysDomain } from '@resources/voucher/domain/voucher-usage-day.domain';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherDomainCreateInput,
  VoucherImgCreateInput,
  VoucherImgDomain,
  VoucherImgUpdateInput,
  VoucherStatusEnum,
  VoucherTagDomain,
  VoucherTermAndCondCreateInput,
} from '@resources/voucher/domain/voucher.domain';
import { CreateVoucherPromotionDto } from '@resources/voucher/dto/voucher-promotion/create-promotion.dto';
import { UpdateVoucherPromotionDto } from '@resources/voucher/dto/voucher-promotion/update-promotion.dto';
import { UpdateVoucherUsageDayDto } from '@resources/voucher/dto/voucher-usage-day.dto';
import { UpdateVoucherDto } from '@resources/voucher/dto/vouchers/update-voucher.dto';
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
  abstract createVoucherAndTermAndImgAndPromotionTransaction({
    voucherData,
    termAndCondThArr,
    termAndCondEnArr,
    image,
    promotion,
  }: {
    voucherData: VoucherDomainCreateInput;
    termAndCondThArr: VoucherTermAndCondCreateInput[];
    termAndCondEnArr: VoucherTermAndCondCreateInput[];
    image: VoucherImgCreateInput[];
    promotion?: VoucherPromotionCreateInput;
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
   * @param categoryName string
   * @param tagName string
   * @returns VoucherAndPackageDateType
   * Due to voucher grouping into category or room
   * this service provide a way to search for voucher
   * via category name or tag name
   */
  abstract findByCategory(
    categoryName: VoucherCategoryDomain['name'],
    voucherStatus: VoucherStatusEnum,
    tagName?: VoucherTagDomain['name'],
  ): Promise<VoucherDomain[]>;
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
  abstract findBySearchContent(searchContent: string): Promise<VoucherDomain[]>;

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
  }: {
    tag?: VoucherTagDomain['name'];
    category?: VoucherCategoryDomain['name'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    sortOption?: unknown;
  }): Promise<VoucherDomain[]>;

  abstract update(data: UpdateVoucherDto): Promise<VoucherDomain>;
}

export abstract class VoucherCategoryRepository {
  abstract findById(
    id: VoucherCategoryDomain['id'],
  ): Promise<NullAble<VoucherCategoryDomain>>;
  abstract create(
    data: Omit<VoucherCategoryDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<VoucherCategoryDomain>;
  abstract findManyWithPagination({
    paginationOption,
    sortOption,
  }: {
    paginationOption?: IPaginationOption;
    sortOption?: any;
  }): Promise<VoucherCategoryDomain[]>;
}

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
    category?: VoucherCategoryDomain['name'] | VoucherCategoryDomain['id'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    sortOption?: unknown;
  }): Promise<NullAble<VoucherTagDomain[]>>;
  abstract findManyByCategoryNameAndTagName(
    categoryName: VoucherCategoryDomain['name'],
    {
      tagName,
      cursor,
    }: {
      tagName?: VoucherTagDomain['name'];
      cursor?: VoucherTagDomain['id'];
    },
  ): Promise<NullAble<VoucherTagDomain[]>>;
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

export abstract class VoucherPromotionRepository {
  abstract createPromotion(
    data: CreateVoucherPromotionDto,
  ): Promise<VoucherPromotionDomain>;
  abstract findById(
    id: VoucherPromotionDomain['id'],
  ): Promise<NullAble<VoucherPromotionDomain>>;
  abstract findMany({
    paginationOption,
    sortOptions,
    cursor,
    name,
  }: {
    paginationOption?: IPaginationOption;
    sortOptions?: unknown;
    cursor?: VoucherPromotionDomain['id'];
    name?: VoucherPromotionDomain['name'];
  }): Promise<VoucherPromotionDomain[]>;
  abstract updatePromotion(
    data: UpdateVoucherPromotionDto,
  ): Promise<VoucherPromotionDomain>;
  abstract deletePromotion(id: VoucherPromotionDomain['id']): Promise<void>;
}

export abstract class VoucherUsageDayRepository {
  abstract findCurrent(): Promise<VoucherUsageDaysDomain>;

  abstract update(
    payload: UpdateVoucherUsageDayDto,
  ): Promise<VoucherUsageDaysDomain>;
}
