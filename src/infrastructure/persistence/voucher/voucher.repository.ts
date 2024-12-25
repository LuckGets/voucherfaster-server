import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherTagDomain,
} from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';

export abstract class VoucherRepository {
  abstract findById(id: VoucherDomain['id']): Promise<NullAble<VoucherDomain>>;
}

export abstract class VoucherCategoryRepository {
  abstract findById(
    id: VoucherCategoryDomain['id'],
  ): Promise<NullAble<VoucherCategoryDomain>>;
  abstract create(
    data: Omit<VoucherCategoryDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<VoucherCategoryDomain>;
}

export abstract class VoucherTagRepository {
  abstract findById(
    id: VoucherTagDomain['id'],
  ): Promise<NullAble<VoucherTagDomain>>;
  abstract create(
    data: Omit<VoucherTagDomain, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<VoucherTagDomain>;
}
