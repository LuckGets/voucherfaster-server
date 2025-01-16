import { AccountDomain } from '@resources/account/domain/account.domain';
import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { CreateOrderDto } from '@resources/order/dto/create-order.dto';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { UsableDaysAfterPurchasedDomain } from '@resources/usable-days/domain/usable-day.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';

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

export type UpdateStockAmountInfo = {
  vouchers: UpdateStockAmountEachInfo[];
  promotions: UpdateStockAmountEachInfo[];
  packages: UpdateStockAmountEachInfo[];
};

export type UpdateStockAmountEachInfo = {
  id:
    | VoucherDomain['id']
    | VoucherPromotionDomain['id']
    | PackageVoucherDomain['id'];
  updatedStockAmount: number;
};

export type CreateOrderAndTransactionInput = {
  payload: Omit<CreateOrderDto, 'paymentToken' | 'items'>;
  accountId: AccountDomain['id'];
  usableDaysAfterPurchasedId: UsableDaysAfterPurchasedDomain['id'];
  updateStockAmountInfo: UpdateStockAmountInfo;
  voucherIdList?: CreateOrderVoucherIdList;
  promotionIdList?: CreateOrderPromotionIdList;
  packageIdList?: CreateOrderPackageIdList;
};

export abstract class OrderRepository {
  abstract createOrderAndTransaction({
    payload,
    accountId,
    usableDaysAfterPurchasedId,
    updateStockAmountInfo,
    voucherIdList,
    promotionIdList,
    packageIdList,
  }: CreateOrderAndTransactionInput): Promise<OrderDomain>;
}
