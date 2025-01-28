import { AccountDomain } from '@resources/account/domain/account.domain';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';
import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import { PackageDiscountDomain } from '@resources/package/domain/package-discount.domain';

export type CreateOrderItemVoucherInfo = {
  id: string;
  voucherId: VoucherDomain['id'];
  discount?: Pick<PackageDiscountDomain, 'id' | 'discountedPrice'>;
};

export type CreateOrderItemPackageInfo = {
  id: string;
  voucherId: VoucherDomain['id'];
  packageId: PackageVoucherDomain['id'];
  reward: boolean;
  discount?: Pick<PackageDiscountDomain, 'id' | 'discountedPrice'>;
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
  orderId: OrderDomain['id'];
  detail: CreateOrderItemVoucherInfo | CreateOrderItemPackageInfo;
  code: OrderItemDomain['code'];
  qrcodeImagePath: string;
  usableAt: PackageVoucherDomain['usableAt'];
  usableExpiredAt: PackageVoucherDomain['usableExpiredAt'];
};

export type CreateOrderAndTransactionInput = {
  payload: { id: OrderDomain['id']; totalPrice: number };
  accountId: AccountDomain['id'];
  updateStockAmountInfo: UpdateStockAmountInfo;
  transaction: Pick<TransactionDomain, 'status' | 'id'>;
  allOrderItemsInfo: CreateOrderItemInfo[];
};

export abstract class OrderRepository {
  abstract createOrderAndTransaction(
    payload: CreateOrderAndTransactionInput,
  ): Promise<OrderDomain>;

  abstract findById(id: string): Promise<NullAble<OrderDomain>>;

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
