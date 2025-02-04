import { PackageRewardVoucher } from '@prisma/client';
import {
  PackageRewardVoucherDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import {
  AllPackageVoucherEntityInformation,
  PackageVoucherMapper,
} from './package.mapper';
import { ObjectHelper } from '@utils/services/object.helper';

type PackageRewardVoucherAndPackageInfo = PackageRewardVoucher & {
  package?: AllPackageVoucherEntityInformation;
};

export class PackageRewardMapper {
  public static toDomain(
    packageEntity: PackageRewardVoucher,
  ): PackageRewardVoucherDomain {
    if (ObjectHelper.isObjectEmpty(packageEntity)) return null;

    const {
      id,
      rewardVoucherId,
      amount,
      packageId,
      img,
      updatedAt,
      deletedAt,
    } = packageEntity;
    return new PackageRewardVoucherDomain({
      id,
      voucherId: rewardVoucherId,
      amount,
      packageId,
      img,
      updatedAt,
      deletedAt,
    });
  }

  public static toPackageDomain(
    packageEntity: PackageRewardVoucherAndPackageInfo,
  ): PackageVoucherDomain {
    const packageInfo = packageEntity.package;
    const isRewardVoucherAdded = packageInfo.PackageRewardVoucher.find(
      (item) => item.rewardVoucherId === packageEntity.rewardVoucherId,
    );
    if (!ObjectHelper.isObjectEmpty(isRewardVoucherAdded)) {
      return PackageVoucherMapper.toDomain(packageInfo, { allInfo: true });
    } else {
      packageInfo.PackageRewardVoucher.push(packageEntity);

      return PackageVoucherMapper.toDomain(packageInfo, { allInfo: true });
    }
  }
}
