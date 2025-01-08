import {
  PackageRewardVoucherCreateInput,
  PackageRewardVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';

export abstract class PackageRewardVoucherRepository {
  abstract create(
    data: PackageRewardVoucherCreateInput,
  ): Promise<PackageRewardVoucherDomain>;
}
