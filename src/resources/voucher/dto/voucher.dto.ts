import { CoreApiResponse } from 'src/common/core-api-response';
import { VoucherDomain } from '../domain/voucher.domain';
import { PackageVoucherDomain } from '../domain/package-voucher.domain';

export type VoucherAndPackageDataType = {
  voucher: VoucherDomain[];
  package: PackageVoucherDomain[];
};

export class GetVoucherResponse extends CoreApiResponse {}
