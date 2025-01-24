import { Account, Order, UsableDaysAfterPurchased } from '@prisma/client';
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
import { ErrorApiResponse } from 'src/common/core-api-response';
import { ObjectHelper } from '@utils/services/object.helper';
import { AccountMapper } from '../../account/prisma-relational/account.mapper';
import { RoleEnum } from '@resources/account/types/account.type';

export type AllOrderInformation = Order & {
  account?: Partial<Account>;
  Transaction?: TransactionAndSystem;
  OrderItem?: OrderItemAndDetails[];
  usableDaysAfterPurchased?: Pick<UsableDaysAfterPurchased, 'usableDays'>;
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
    const {
      Transaction,
      usableDaysAfterPurchased,
      OrderItem,
      account,
      ...order
    } = orderAndTransactionEntity;

    // ORDER MAPPING PART
    const orderDomain = new OrderDomain();
    orderDomain.id = order.id;

    if (!ObjectHelper.isObjectEmpty(account)) {
      orderDomain.account = {
        id: account.id,
        email: account.email,
        fullname: account.fullname,
        phone: account.phone,
        verifiedAt: account.verifiedAt,
        role: RoleEnum[account.role.toUpperCase()],
      };
    }

    orderDomain.totalPrice = order.totalPrice.toNumber();
    orderDomain.createdAt = order.createdAt;
    orderDomain.updatedAt = order.updatedAt;

    if (ObjectHelper.isObjectEmpty(usableDaysAfterPurchased)) {
      throw ErrorApiResponse.internalServerError(
        `There is no usable day for this order. So it could not be processed.`,
      );
    }
    // Find Usable day part.
    const resetCreatedDate = new Date(
      new Date(orderAndTransactionEntity.createdAt).setHours(0, 0, 0, 0),
    );
    orderDomain.usableDay = new Date(
      resetCreatedDate.getTime() +
        CalculatorService.changedayToMilliseconde(
          usableDaysAfterPurchased?.usableDays,
        ),
    );

    // TRANSACTION MAPPING PART
    if (Transaction && Object.keys(Transaction).length > 0) {
      const transaction: TransactionDomain =
        TransactionMapper.toDomain(Transaction);

      orderDomain.transaction = { ...transaction };
    }

    if (OrderItem && OrderItem.length > 0) {
      orderDomain.orderItems = [
        ...OrderItem.map((item) =>
          OrderItemMapper.toDomain(item, { allInfo: false }),
        ),
      ];
    }

    return orderDomain;
  }
}
