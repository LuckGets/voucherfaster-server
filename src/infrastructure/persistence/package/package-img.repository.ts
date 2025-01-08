import { PackageImgCreateInput } from '@resources/package/domain/package-voucher.domain';

export abstract class PackageImgRepository {
  abstract createMany(imgData: PackageImgCreateInput[]): Promise<void>;
}
