import {
  PackageVoucher,
  PackageRewardVoucher,
  PackageImg,
} from '@prisma/client';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { ErrorApiResponse } from 'src/common/core-api-response';

type AllPackageVoucherEntityInformation = PackageVoucher & {
  PackageRewardVoucher?: Partial<PackageRewardVoucher>[];
  PackageImg?: Partial<PackageImg>[];
};

export class PackageVoucherMapper {
  public static toDomain(
    packageVoucherEntity: AllPackageVoucherEntityInformation,
  ): PackageVoucherDomain {
    if (!packageVoucherEntity) return null;
    const packageVoucherDomain = new PackageVoucherDomain();
    packageVoucherDomain.id = packageVoucherEntity.id;
    packageVoucherDomain.title = packageVoucherEntity.title;
    packageVoucherDomain.price = packageVoucherEntity.packagePrice.toNumber();
    packageVoucherDomain.stockAmount = packageVoucherEntity.stockAmount;
    packageVoucherDomain.quotaVoucherId = packageVoucherEntity.quotaVoucherId;
    packageVoucherDomain.quotaAmount = packageVoucherEntity.quotaAmount;
    packageVoucherDomain.startedAt = packageVoucherEntity.startedAt;
    packageVoucherDomain.expiredAt = packageVoucherEntity.expiredAt;
    packageVoucherDomain.createdAt = packageVoucherEntity.createdAt;
    packageVoucherDomain.updatedAt = packageVoucherEntity.updatedAt;
    packageVoucherDomain.deletedAt = packageVoucherEntity.deletedAt;
    if (
      packageVoucherEntity.PackageImg &&
      packageVoucherEntity.PackageImg.length > 0
    ) {
      packageVoucherDomain.images = packageVoucherEntity.PackageImg.map(
        (item) => ({
          id: item.id,
          mainImg: item.mainImg,
          imgPath: item.imgPath,
        }),
      );
    }

    if (
      packageVoucherEntity.PackageRewardVoucher &&
      packageVoucherEntity.PackageRewardVoucher.length > 0
    ) {
      packageVoucherDomain.rewardVouchers =
        packageVoucherEntity.PackageRewardVoucher.map((item) => ({
          id: item.id,
          voucherId: item.rewardVoucherId,
        }));
    } else {
      throw ErrorApiResponse.conflictRequest(
        `Package voucher should have at least one reward voucher but package ID: ${packageVoucherEntity.id} does not have any reward voucher.`,
      );
    }
    return packageVoucherDomain;
  }
}
