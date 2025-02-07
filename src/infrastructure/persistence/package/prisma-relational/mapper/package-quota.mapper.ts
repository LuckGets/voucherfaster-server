import { PackageQuotaVoucher } from '@prisma/client';
import {
  PackageQuotaVoucherDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import {
  AllPackageVoucherEntityInformation,
  PackageVoucherMapper,
} from '../mapper/package.mapper';
import { ObjectHelper } from '@utils/services/object.helper';

type PackageQuotaVoucherInformation = PackageQuotaVoucher & {
  package?: AllPackageVoucherEntityInformation;
};

export class PackageQuotaVoucherMapper {
  public static toDomain(
    packageQuotaVoucher: PackageQuotaVoucher,
  ): PackageQuotaVoucherDomain {
    if (ObjectHelper.isObjectEmpty(packageQuotaVoucher)) return null;

    return new PackageQuotaVoucherDomain({
      id: packageQuotaVoucher.id,
      amount: packageQuotaVoucher.amount,
      voucherId: packageQuotaVoucher.quotaVoucherId,
      packageId: packageQuotaVoucher.packageId,
      updatedAt: packageQuotaVoucher.updatedAt,
      deletedAt: packageQuotaVoucher.deletedAt,
    });
  }

  public static toPackageDomain(
    quotaVoucherEntity: PackageQuotaVoucherInformation,
  ): PackageVoucherDomain {
    if (ObjectHelper.isObjectEmpty(quotaVoucherEntity)) return null;

    if (ObjectHelper.isObjectEmpty(quotaVoucherEntity.package))
      throw Error(
        `Package not found for quota voucher ID: ${quotaVoucherEntity.id}`,
      );

    const { PackageQuotaVoucher } = quotaVoucherEntity.package;

    if (
      PackageQuotaVoucher.filter(
        (item) => item.quotaVoucherId === quotaVoucherEntity.quotaVoucherId,
      ).length > 0
    ) {
      return PackageVoucherMapper.toDomain(quotaVoucherEntity.package, {
        allInfo: true,
      });
    } else {
      const quotaVoucher: PackageQuotaVoucher = {
        id: quotaVoucherEntity.id,
        amount: quotaVoucherEntity.amount,
        quotaVoucherId: quotaVoucherEntity.quotaVoucherId,
        updatedAt: quotaVoucherEntity.updatedAt,
        packageId: quotaVoucherEntity.packageId,
        deletedAt: quotaVoucherEntity.deletedAt,
      };
      quotaVoucherEntity.package.PackageQuotaVoucher.push(quotaVoucher);

      return PackageVoucherMapper.toDomain(quotaVoucherEntity.package, {
        allInfo: true,
      });
    }
  }
}
