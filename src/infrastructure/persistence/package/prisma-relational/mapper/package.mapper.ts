import {
  PackageVoucher,
  PackageRewardVoucher,
  PackageImg,
  Voucher,
  VoucherTag,
  Category,
  PackageDiscount,
} from '@prisma/client';
import {
  PackageDiscountDomain,
  PackageDiscountStatusEnum,
} from '@resources/package/domain/package-discount.domain';
import {
  PackageRewardVoucherDomain,
  PackageStatusEnum,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import { ProductTypeEnum } from 'src/common/types/product.type';

type NestedVoucherTagAndCategory = Voucher & {
  voucherTag?: VoucherTag & {
    category?: Pick<Category, 'id' | 'name'>;
  };
};

type AllPackageVoucherEntityInformation = PackageVoucher & {
  voucherTag?: VoucherTag & {
    category?: Pick<Category, 'id' | 'name'>;
  };
  PackageRewardVoucher?: (Partial<PackageRewardVoucher> & {
    voucher?: NestedVoucherTagAndCategory;
  })[];
  PackageImg?: Partial<PackageImg>[];
  PackageDiscount?: PackageDiscount[];
};

export class PackageVoucherMapper {
  public static toDomain(
    packageVoucherEntity: AllPackageVoucherEntityInformation,
    options: { allInfo: boolean },
  ): PackageVoucherDomain {
    if (ObjectHelper.isObjectEmpty(packageVoucherEntity)) return null;

    const {
      voucherTag,
      PackageImg,
      PackageRewardVoucher,
      PackageDiscount,
      ...packageInfo
    } = packageVoucherEntity;

    if (PackageRewardVoucher.length < 1) {
      throw new Error(
        `Package voucher should have at least one reward voucher but package ID: ${packageVoucherEntity.id} does not have any reward voucher.`,
      );
    }
    const categoryName = voucherTag?.category?.name;
    const tagName = voucherTag?.name;

    let packageDiscount: PackageVoucherDomain['discount'];

    if (PackageDiscount && PackageDiscount.length > 0) {
      if (PackageDiscount.length > 1)
        throw new Error(
          `Package voucher should have only one currently active discount but package ID: ${packageVoucherEntity.id} has more than one discount.`,
        );
      const { discountedPrice, status, id } = PackageDiscount[0];
      const discountStatus = PackageDiscountStatusEnum[status];
      packageDiscount = new PackageDiscountDomain({
        id,
        discountedPrice: discountedPrice.toNumber(),
        status: discountStatus,
      });
    }

    let packageImg: PackageVoucherDomain['images'] = [];

    if (PackageImg && PackageImg.length > 0) {
      packageImg = PackageImg.map((item) => ({
        id: item.id,
        mainImg: item.mainImg,
        imgPath: item.imgPath,
      }));
    }

    const rewardVouchers: PackageVoucherDomain['rewardVouchers'] =
      PackageRewardVoucher.map((item) => {
        const rewardVoucher: PackageRewardVoucherDomain = {
          id: item.id,
          voucherId: item.rewardVoucherId,
          amount: item.amount,
        };

        if (options.allInfo) rewardVoucher.img = item.img;
        return rewardVoucher;
      });

    if (!options.allInfo) delete packageInfo.termAndCondition;

    const packageVoucherDomain = new PackageVoucherDomain({
      ...packageInfo,
      price: packageInfo.price.toNumber(),
      status: PackageStatusEnum[packageInfo.status],
      tag: tagName,
      category: categoryName,
      images: packageImg,
      discount: packageDiscount,
    });

    if (options.allInfo) packageVoucherDomain.rewardVouchers = rewardVouchers;

    switch (options.allInfo) {
      case true:
        ObjectHelper.findEmptyFieldAndThrowError(
          packageVoucherDomain,
          PackageVoucherDomain.getRequiredFieldForDetail(),
          ProductTypeEnum.PACKAGE,
        );
        break;
      case false:
        ObjectHelper.findEmptyFieldAndThrowError(
          packageVoucherDomain,
          PackageVoucherDomain.getRequiredFieldForList(),
          ProductTypeEnum.PACKAGE,
        );
        break;
    }

    return packageVoucherDomain;
  }
}
