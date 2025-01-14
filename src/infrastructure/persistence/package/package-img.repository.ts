import {
  PackageImgCreateInput,
  PackageImgDomain,
} from '@resources/package/domain/package-voucher.domain';
import { NullAble } from '@utils/types/common.type';

export abstract class PackageImgRepository {
  abstract createMany(
    imgData: PackageImgCreateInput[],
  ): Promise<PackageImgDomain[]>;

  abstract findById(
    id: PackageImgDomain['id'],
  ): Promise<NullAble<PackageImgDomain>>;

  abstract update(
    id: PackageImgDomain['id'],
    payload: PackageImgDomain['imgPath'],
  ): Promise<PackageImgDomain>;

  abstract deleteById(id: PackageImgDomain['id']): Promise<void>;
}
