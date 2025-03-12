import { Account, Order } from '@prisma/client';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import {
  TransactionAndSystem,
  TransactionMapper,
} from '../../transaction/prisma-relational/transaction.mapper';
import {
  OrderItemAndDetails,
  OrderItemMapper,
} from '../../order-item/prisma-relational/order-item.mapper';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { ObjectHelper } from '@utils/services/object.helper';
import { AccountMapper } from '../../account/prisma-relational/account.mapper';

export type AllOrderInformation = Order & {
  account?: Partial<Account>;
  Transaction?: TransactionAndSystem;
  OrderItem?: OrderItemAndDetails[];
};

export class OrderMapper {
  /**
   * Maps an entity containing order and transaction information to
   * an OrderAndTransactionType domain object.
   *
   * @param {AllOrderInformation} orderAndTransactionEntity - The entity object
   * containing order and related transaction data.
   * @returns {OrderDomain} The domain object representing the
   * order and its associated transaction.
   */
  public static toDomain(
    orderAndTransactionEntity: AllOrderInformation,
  ): OrderDomain {
    console.log('Order in map', orderAndTransactionEntity);
    if (ObjectHelper.isObjectEmpty(orderAndTransactionEntity)) return null;
    // EXTRACT DATA
    const { Transaction, OrderItem, account, ...order } =
      orderAndTransactionEntity;

    // ORDER MAPPING PART

    if (ObjectHelper.isObjectEmpty(account)) {
      throw ErrorApiResponse.internalServerError(
        `Account is empty for order ID: ${order.id}`,
      );
    }
    const accountDetail = {
      id: account.id,
      email: account.email,
      fullname: account.fullname,
      phone: account.phone,
      verifiedAt: account.verifiedAt,
      role: AccountMapper.toRoleDomain(account.role),
    };
    // TRANSACTION MAPPING PART
    if (Transaction && Object.keys(Transaction).length === 0) {
      throw ErrorApiResponse.internalServerError(
        `Transaction is empty for order ID: ${order.id}`,
      );
    }

    const transaction: TransactionDomain =
      TransactionMapper.toDomain(Transaction);

    const orderDomain = new OrderDomain({
      id: order.id,
      totalPrice: order.totalPrice.toNumber(),
      account: accountDetail,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deletedAt: order.deletedAt ?? null,
      transaction,
    });
    if (OrderItem) {
      if (OrderItem.length === 0)
        throw ErrorApiResponse.internalServerError(
          `OrderItem is empty for order ID: ${order.id}`,
        );
      orderDomain.orderItems = [
        ...OrderItem.map((item) =>
          OrderItemMapper.toDomain(item, { allInfo: false }),
        ),
      ];
    }

    return orderDomain;
  }
}
