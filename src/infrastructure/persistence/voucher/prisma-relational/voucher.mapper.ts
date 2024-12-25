import { Voucher } from '@prisma/client';
import {
  VoucherDomain,
  VoucherStatusEnum,
} from '@resources/voucher/domain/voucher.domain';
import { plainToInstance } from 'class-transformer';

export class VoucherMapper {
  public static toDomain(voucherEntity: Voucher): VoucherDomain {
    const voucherDomain = plainToInstance(VoucherDomain, voucherEntity);
    voucherDomain.status = VoucherStatusEnum[voucherEntity.status];
    return voucherDomain;
  }
}
