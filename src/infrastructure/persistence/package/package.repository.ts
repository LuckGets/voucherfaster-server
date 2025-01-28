import { Injectable } from '@nestjs/common';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { PackageDiscountDomain } from '@resources/package/domain/package-discount.domain';
import {
  PackageImgCreateInput,
  PackageRewardVoucherCreateInput,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import {
  PackageSellDateQueryEnum,
  PackageStatusQueryEnum,
} from '@resources/package/dto/get-package.dto';
import {
  UpdatePackageDiscountDto,
  UpdatePackageVoucherDto,
} from '@resources/package/dto/update-package.dto';
import { NullAble } from '@utils/types/common.type';

export type PackageVoucherCreateInput = {
  id: string;
  description: string;
  quotaVoucherId: string;
  quotaAmount: number;
  stockAmount: number;
  sellStartedAt: Date;
  sellExpiredAt: Date;
  usableAt: Date;
  usableExpiredAt: Date;
  price: number;
  title: string;
  termAndCondition: string;
};

export type PackageVoucherDiscountNestedCreateInput = {
  id: PackageDiscountDomain['id'];
  discountedPrice: PackageDiscountDomain['discountedPrice'];
};

export type UpdatePackageVoucherDiscountRepositoryInput = {
  update?: UpdatePackageDiscountDto;
  create?: {
    id: PackageDiscountDomain['id'];
    discountedPrice: PackageDiscountDomain['discountedPrice'];
  };
};

export type UpdatePackageVoucherRepositoryInput = Omit<
  UpdatePackageVoucherDto,
  'discount'
> & {
  discount?: UpdatePackageVoucherDiscountRepositoryInput;
};

@Injectable()
export abstract class PackageVoucherRepository {
  abstract createPackageVoucher({
    packageVoucherCreateInput,
    packageDiscountedPrice,
    packageImage,
    packageRewardVoucher,
  }: {
    packageVoucherCreateInput: PackageVoucherCreateInput;
    packageDiscountedPrice?: PackageVoucherDiscountNestedCreateInput;
    packageImage: PackageImgCreateInput[];
    packageRewardVoucher: PackageRewardVoucherCreateInput[];
  }): Promise<PackageVoucherDomain>;

  /**
   *
   * @returns PackageVoucherDomain
   *
   * Find many package voucher.
   */
  abstract findManyPackageVoucher({
    cursor,
    category,
    status,
    sellDate,
  }: {
    cursor?: PackageVoucherDomain['id'];
    category?: CategoryDomain['name'];
    status?: PackageStatusQueryEnum;
    sellDate?: PackageSellDateQueryEnum;
  }): Promise<PackageVoucherDomain[]>;

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
    data: UpdatePackageVoucherRepositoryInput,
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
