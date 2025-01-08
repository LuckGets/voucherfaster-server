import { PackageRewardVoucher } from '@prisma/client';
import { PackageRewardVoucherDomain } from '@resources/package/domain/package-voucher.domain';

export class PackageRewardVoucherMapper {
  public static toDomain(
    entity: PackageRewardVoucher,
  ): PackageRewardVoucherDomain {
    return;
  }
}
