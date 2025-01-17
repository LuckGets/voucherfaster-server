import { Order, UsableDaysAfterPurchased } from '@prisma/client';
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
import { CalculatorService } from '@utils/services/calculator.service';

type AllOrderInformation = Order & {
  Transaction?: TransactionAndSystem;
  OrderItem?: OrderItemAndDetails[];
  usableDaysAfterPurchased: Partial<UsableDaysAfterPurchased>;
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
    if (
      !orderAndTransactionEntity ||
      Object.keys(orderAndTransactionEntity).length === 0
    )
      return null;
    // EXTRACT DATA
    const { Transaction, usableDaysAfterPurchased, OrderItem, ...order } =
      orderAndTransactionEntity;

    // ORDER MAPPING PART
    const orderDomain = new OrderDomain();
    orderDomain.id = order.id;
    orderDomain.accountId = order.accountId;
    orderDomain.totalPrice = order.totalPrice.toString();
    orderDomain.createdAt = order.createdAt;
    orderDomain.updatedAt = order.updatedAt;

    // Find Usable day part.
    orderDomain.usableDay = new Date(
      orderAndTransactionEntity.createdAt.getTime() +
        CalculatorService.changedayToMilliseconde(
          orderAndTransactionEntity.usableDaysAfterPurchased.usableDays,
        ),
    );

    // TRANSACTION MAPPING PART
    if (Transaction && Object.keys(Transaction).length > 0) {
      const transaction: TransactionDomain =
        TransactionMapper.toDomain(Transaction);

      orderDomain.transaction = { ...transaction };
    }

    if (OrderItem && OrderItem.length > 0) {
      orderDomain.orderItems = [...OrderItem.map(OrderItemMapper.toDomain)];
    }

    return orderDomain;
  }
}
