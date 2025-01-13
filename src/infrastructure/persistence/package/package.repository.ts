import { Injectable } from '@nestjs/common';
import {
  packageVoucherTermAndCondENCreateInput,
  packageVoucherTermAndCondTHCreateInput,
} from '@resources/package/domain/package-voucher-term-cond.domain';
import {
  PackageImgCreateInput,
  PackageRewardVoucherCreateInput,
  PackageVoucherCreateInput,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { UpdatePackageVoucherDto } from '@resources/package/dto/update-package.dto';
import { NullAble } from '@utils/types/common.type';

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
    packageVoucherTermAndCondTH: packageVoucherTermAndCondTHCreateInput[];
    packageVoucherTermAndCondEN: packageVoucherTermAndCondENCreateInput[];
  }): Promise<PackageVoucherDomain>;

  /**
   *
   * @returns PackageVoucherDomain
   *
   * Find many package voucher.
   */
  abstract findManyPackageVoucher(): Promise<PackageVoucherDomain[]>;

  abstract findPackageVoucherById(
    id: PackageVoucherDomain['id'],
  ): Promise<NullAble<PackageVoucherDomain>>;

  /**
   *
   * @param data UpdatePackageVoucherDto
   * @returns PackageVoucherDomain
   *
   * Update one specific package voucher.
   */
  abstract updatePackageVoucher(
    data: UpdatePackageVoucherDto,
  ): Promise<PackageVoucherDomain>;
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
