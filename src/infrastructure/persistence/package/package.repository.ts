import { Injectable } from '@nestjs/common';
import {
  PackageImgCreateInput,
  PackageRewardVoucherCreateInput,
  PackageVoucherCreateInput,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';

@Injectable()
export abstract class PackageVoucherRepository {
  abstract createPackageVoucher({
    packageVoucherCreateInput,
    packageImage,
    packageRewardVoucher,
  }: {
    packageVoucherCreateInput: PackageVoucherCreateInput;
    packageImage: PackageImgCreateInput[];
    packageRewardVoucher: PackageRewardVoucherCreateInput[];
  }): Promise<PackageVoucherDomain>;

  abstract findManyPackageVoucher(): Promise<PackageVoucherDomain[]>;

  /**
   *
   * @param packageId string
   * @returns void
   *
   * Delete one package voucher by ID
   */
  abstract deletePackageVoucherById(
    packageId: PackageVoucherDomain['id'],
  ): Promise<void>;
}
