import { AccountDomain } from '@resources/account/domain/account.domain';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { CreateOrderDto } from '@resources/order/dto/create-order.dto';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { VoucherUsageDaysDomain } from '@resources/voucher/domain/voucher-usage-day.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';

export type CreateOrderVoucherIdList = {
  id: string;
  voucherId: VoucherDomain['id'];
}[];

export type CreateOrderPromotionIdList = {
  id: string;
  promotionId: VoucherPromotionDomain['id'];
}[];

type PackageList = {
  id: string;
  voucherId: VoucherDomain['id'];
  packageId: PackageVoucherDomain['id'];
};

export type CreateOrderPackageIdList = {
  quotaList: PackageList[];
  rewardList: PackageList[];
};

export type OrderAndTransactionType = {
  order: OrderDomain;
  transaction: string;
};

export type CreateOrderAndTransactionInput = {
  payload: Omit<CreateOrderDto, 'paymentToken' | 'items'>;
  accountId: AccountDomain['id'];
  voucherUsageDayId: VoucherUsageDaysDomain['id'];
  voucherIdList?: CreateOrderVoucherIdList;
  promotionIdList?: CreateOrderPromotionIdList;
  packageIdList?: CreateOrderPackageIdList;
};

export abstract class OrderRepository {
  abstract createOrderAndTransaction({
    payload,
    accountId,
    voucherUsageDayId,
    voucherIdList,
    promotionIdList,
    packageIdList,
  }: CreateOrderAndTransactionInput): Promise<OrderAndTransactionType>;
}
