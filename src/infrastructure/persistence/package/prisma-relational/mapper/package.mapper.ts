import {
  PackageVoucher,
  PackageRewardVoucher,
  PackageImg,
  VoucherCategory,
  Voucher,
  VoucherTag,
  PackageVoucherTermAndCondTH,
  PackageVoucherTermAndCondEN,
} from '@prisma/client';
import {
  PackageRewardVoucherDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import { ErrorApiResponse } from 'src/common/core-api-response';

type NestedVoucherTagAndCategory = Voucher & {
  voucherTag?: VoucherTag & {
    voucherCategory?: Partial<VoucherCategory>;
  };
};

type AllPackageVoucherEntityInformation = PackageVoucher & {
  voucher?: NestedVoucherTagAndCategory;
  PackageRewardVoucher?: (Partial<PackageRewardVoucher> & {
    voucher?: NestedVoucherTagAndCategory;
  })[];
  PackageImg?: Partial<PackageImg>[];
  PackageVoucherTermAndCondTH?: Partial<PackageVoucherTermAndCondTH>[];
  PackageVoucherTermAndCondEN?: Partial<PackageVoucherTermAndCondEN>[];
};

export class PackageVoucherMapper {
  public static toDomain(
    packageVoucherEntity: AllPackageVoucherEntityInformation,
  ): PackageVoucherDomain {
    if (!packageVoucherEntity) return null;
    const {
      voucher,
      PackageImg,
      PackageRewardVoucher,
      PackageVoucherTermAndCondEN,
      PackageVoucherTermAndCondTH,
    } = packageVoucherEntity;
    const packageVoucherDomain = new PackageVoucherDomain();
    packageVoucherDomain.id = packageVoucherEntity.id;
    packageVoucherDomain.title = packageVoucherEntity.title;
    packageVoucherDomain.price = packageVoucherEntity.price.toNumber();
    packageVoucherDomain.stockAmount = packageVoucherEntity.stockAmount;
    packageVoucherDomain.quotaVoucherId = packageVoucherEntity.quotaVoucherId;
    packageVoucherDomain.quotaAmount = packageVoucherEntity.quotaAmount;
    packageVoucherDomain.usableAt = packageVoucherEntity.usableAt;
    packageVoucherDomain.usableExpiredAt = packageVoucherEntity.usableExpiredAt;
    packageVoucherDomain.sellStartedAt = packageVoucherEntity.sellStartedAt;
    packageVoucherDomain.sellExpiredAt = packageVoucherEntity.sellExpiredAt;
    packageVoucherDomain.createdAt = packageVoucherEntity.createdAt;
    packageVoucherDomain.updatedAt = packageVoucherEntity.updatedAt;
    packageVoucherDomain.deletedAt = packageVoucherEntity.deletedAt;

    if (voucher)
      packageVoucherDomain.category = voucher.voucherTag?.voucherCategory?.name;

    if (PackageImg && PackageImg.length > 0) {
      packageVoucherDomain.images = PackageImg.map((item) => ({
        id: item.id,
        mainImg: item.mainImg,
        imgPath: item.imgPath,
      }));
    }

    if (PackageRewardVoucher && PackageRewardVoucher.length > 0) {
      const rewardVoucher: PackageRewardVoucherDomain[] =
        PackageRewardVoucher.map((item) => ({
          id: item.id,
          voucherId: item.rewardVoucherId,
          amount: item.amount,
          category: item.voucher?.voucherTag?.voucherCategory?.name,
        }));
      packageVoucherDomain.rewardVouchers = rewardVoucher;
    } else {
      throw ErrorApiResponse.conflictRequest(
        `Package voucher should have at least one reward voucher but package ID: ${packageVoucherEntity.id} does not have any reward voucher.`,
      );
    }

    if (
      PackageVoucherTermAndCondTH &&
      PackageVoucherTermAndCondTH.length > 0 &&
      PackageVoucherTermAndCondEN &&
      PackageVoucherTermAndCondEN.length > 0
    ) {
      packageVoucherDomain.termAndCond = {
        en: [],
        th: [],
      };
      packageVoucherDomain.termAndCond.th = PackageVoucherTermAndCondTH.map(
        (item) => ({
          id: item.id,
          description: item.description,
        }),
      );
      packageVoucherDomain.termAndCond.en = PackageVoucherTermAndCondEN.map(
        (item) => ({
          id: item.id,
          description: item.description,
        }),
      );
    }

    ObjectHelper.findEmptyFieldAndThrowError(
      packageVoucherDomain,
      PackageVoucherDomain.getRequiredFieldForList(),
      'Package',
    );
    return packageVoucherDomain;
  }
}
