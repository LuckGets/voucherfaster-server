import { AccountDomain } from '@resources/account/domain/account.domain';
import { OrderDomain } from '@resources/order/domain/order.domain';
import {
  PackageQuotaVoucherDomain,
  PackageRewardVoucherDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';
import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import { PackageDiscountDomain } from '@resources/package/domain/package-discount.domain';
import { VoucherDiscountDomain } from '@resources/voucher/domain/voucher-discount.domain';
import { IPaginationOption } from 'src/common/types/pagination.type';

export type CreateOrderItemVoucherInfo = {
  id: string;
  orderItemId: OrderItemDomain['id'];
  voucherId: VoucherDomain['id'];
  discountId?: VoucherDiscountDomain['id'];
};

export type CreateOrderItemPackageQuotaInfo = {
  id: string;
  orderItemId: OrderItemDomain['id'];
  packageId: PackageVoucherDomain['id'];
  packageQuotaVoucherId: PackageQuotaVoucherDomain['id'];
  discountId?: PackageDiscountDomain['id'];
};

export type CreateOrderItemPackageRewardInfo = {
  id: string;
  orderItemId: OrderItemDomain['id'];
  packageId: PackageVoucherDomain['id'];
  packageRewardVoucherId: PackageRewardVoucherDomain['id'];
  discountId?: PackageDiscountDomain['id'];
};
export type UpdateStockAmountInfo = {
  vouchers: UpdateStockAmountEachInfo[];
  packages: UpdateStockAmountEachInfo[];
};

export type UpdateStockAmountEachInfo = {
  id: VoucherDomain['id'] | PackageVoucherDomain['id'];
  updatedStockAmount: number;
};

export type CreateOrderItemInfo = {
  id: OrderItemDomain['id'];
  code: OrderItemDomain['code'];
  qrcodeImagePath: string;
  usableAt: PackageVoucherDomain['usableAt'];
  usableExpiredAt: PackageVoucherDomain['usableExpiredAt'];
};

export type CreateOrderAndTransactionInput = {
  payload: { totalPrice: number };
  accountId: AccountDomain['id'];
  updateStockAmountInfo: UpdateStockAmountInfo;
  transaction: Pick<TransactionDomain, 'status' | 'id'>;
  allOrderItemsInfo: CreateOrderItemInfo[];
  orderItemsVoucherInfo: CreateOrderItemVoucherInfo[];
  orderItemsPackageInfo: {
    quotas: CreateOrderItemPackageQuotaInfo[];
    rewards: CreateOrderItemPackageRewardInfo[];
  };
};

export abstract class OrderRepository {
  abstract createOrderAndTransaction(
    payload: CreateOrderAndTransactionInput,
  ): Promise<OrderDomain>;

  abstract findByAccountId(
    accountId: OrderDomain['account']['id'],
    {
      cursor,
      paginationOptions,
    }: { cursor: OrderDomain['id']; paginationOptions: IPaginationOption },
  ): Promise<NullAble<OrderDomain[]>>;

  abstract findById(
    id: string,
    { cursor, take }: { cursor?: OrderItemDomain['id']; take?: number },
  ): Promise<NullAble<OrderDomain>>;

  abstract findMany({
    cursor,
    transactionStatus,
  }: {
    cursor?: OrderDomain['id'];
    transactionStatus?: TransactionDomain['status'];
  }): Promise<OrderDomain[]>;

  abstract deleteManyOrderWithUnsuccessTransaction(
    orderList: OrderDomain['id'][],
    transactionIdList: TransactionDomain['id'][],
  ): Promise<void>;
}
