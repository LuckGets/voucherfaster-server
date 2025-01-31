import {
  Category,
  Voucher,
  VoucherDiscount,
  VoucherImg,
  VoucherTag,
} from '@prisma/client';
import {
  VoucherDiscountDomain,
  VoucherDiscountStatusEnum,
} from '@resources/voucher/domain/voucher-discount.domain';
import {
  VoucherDomain,
  VoucherStatusEnum,
} from '@resources/voucher/domain/voucher.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import { ProductTypeEnum } from 'src/common/types/product.type';

type AllVoucherInformation = Voucher & {
  VoucherImg?: Pick<VoucherImg, 'id' | 'imgPath' | 'mainImg'>[];
  VoucherDiscount?: Partial<VoucherDiscount>[];
  voucherTag?: Partial<VoucherTag> & {
    category?: Partial<Category>;
  };
};

export class VoucherMapper {
  /**
   * Converts a voucher entity from the database to a domain object.
   *
   * @param voucherEntity - The voucher entity containing all related information.
   * @param options - Additional options for conversion, such as whether to include all information.
   * @returns A VoucherDomain object or null if the input is empty.
   */
  public static toDomain(
    voucherEntity: AllVoucherInformation,
    options: { allInfo: boolean },
  ): VoucherDomain {
    if (ObjectHelper.isObjectEmpty(voucherEntity)) return null;

    // Destructure necessary properties from the voucher entity
    const {
      VoucherDiscount,
      VoucherImg,
      voucherTag,
      status,
      price,
      ...voucherInfo
    } = voucherEntity;

    // Extract tag and category names
    const tagName = voucherTag?.name;
    const categoryName = voucherTag?.category?.name;

    // Convert status to VoucherStatusEnum
    const voucherStatus = VoucherStatusEnum[status];

    let voucherDiscount = null;
    console.log(VoucherDiscount);
    // Create a VoucherDiscountDomain object
    if (VoucherDiscount && VoucherDiscount.length > 0) {
      if (VoucherDiscount.length > 1 && VoucherDiscount[1].deletedAt === null)
        throw new Error(
          `Voucher ID:${voucherEntity.id} has many discount active at the moment`,
        );

      const [activeVoucherDiscount] = VoucherDiscount;
      if (!activeVoucherDiscount.deletedAt)
        voucherDiscount = new VoucherDiscountDomain({
          id: activeVoucherDiscount?.id,
          discountedPrice: activeVoucherDiscount?.discountedPrice.toNumber(),
          createdAt: activeVoucherDiscount?.createdAt,
          updatedAt: activeVoucherDiscount?.updatedAt,
          status: VoucherDiscountStatusEnum[activeVoucherDiscount?.status],
        });
    }

    if (!options.allInfo) delete voucherInfo.termAndCondition;

    // Construct the VoucherDomain object
    const voucherDomain = new VoucherDomain({
      ...voucherInfo,
      price: price.toNumber(),
      status: voucherStatus,
      tag: tagName,
      category: categoryName,
      discount: voucherDiscount,
      img: VoucherImg,
    });

    // Check for required fields based on the options provided
    if (options.allInfo) {
      ObjectHelper.findEmptyFieldAndThrowError(
        voucherDomain,
        VoucherDomain.requiredFieldForDetail(),
        ProductTypeEnum.VOUCHER,
      );
    } else if (!options.allInfo) {
      ObjectHelper.findEmptyFieldAndThrowError(
        voucherDomain,
        VoucherDomain.requiredFieldForList(),
        ProductTypeEnum.VOUCHER,
      );
    }

    return voucherDomain;
  }
}
