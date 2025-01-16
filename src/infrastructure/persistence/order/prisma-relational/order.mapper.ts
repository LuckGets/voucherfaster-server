import {
  Order,
  OrderItem,
  OrderItemPackage,
  OrderItemPromotion,
  OrderItemVoucher,
  PackageVoucher,
  UsableDaysAfterPurchased,
  Voucher,
  VoucherPromotion,
} from '@prisma/client';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import {
  OrderItemDomain,
  OrderItemPackageDomain,
  OrderItemPromotionDomain,
  OrderItemVoucherDomain,
} from '@resources/order/domain/order-item.domain';
import {
  VoucherMapper,
  VoucherPromotionMapper,
} from '../../voucher/prisma-relational/voucher.mapper';
import {
  TransactionAndSystem,
  TransactionMapper,
} from '../../transaction/prisma-relational/transaction.mapper';

type OrderItemAndDetails = OrderItem & {
  OrderItemVoucher?: OrderItemVoucher & {
    voucher: Voucher;
  };
  OrderItemPromotion?: OrderItemPromotion & {
    voucherPromotion: VoucherPromotion;
  };
  OrderItemPackage?: OrderItemPackage & {
    package: PackageVoucher;
  };
};

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

export class OrderItemMapper {
  /**
   * Maps an entity containing order item and related voucher/package data to
   * an OrderItemDomain domain object.
   *
   * @param {OrderItemAndDetails} orderItemEntity - The entity object containing
   * order item and related voucher/package data.
   * @returns {OrderItemDomain} The domain object representing the order item and
   * its associated voucher/package.
   */
  public static toDomain(
    orderItemEntity: OrderItemAndDetails,
  ): OrderItemDomain {
    const {
      OrderItemVoucher,
      OrderItemPromotion,
      OrderItemPackage,
      ...orderItem
    } = orderItemEntity;
    const orderItemDomain = new OrderItemDomain();
    orderItemDomain.id = orderItem.id;
    orderItemDomain.qrcodeImagePath = orderItem.qrcodeImgPath;
    orderItemDomain.redeemedAt = orderItem.redeemedAt;
    orderItemDomain.updatedAt = orderItem.updatedAt;

    if (OrderItemVoucher) {
      // Map to OrderItemVoucherDomain
      orderItemDomain.item = new OrderItemVoucherDomain();
      orderItemDomain.item.id = OrderItemVoucher.id;
      orderItemDomain.item.voucher = VoucherMapper.toDomain(
        OrderItemVoucher.voucher,
      );
    } else if (OrderItemPromotion) {
      // Map to OrderItemPromotionDomain
      orderItemDomain.item = new OrderItemPromotionDomain();
      orderItemDomain.item.id = OrderItemPromotion.id;
      orderItemDomain.item.promotionVoucher = VoucherPromotionMapper.toDomain(
        OrderItemPromotion.voucherPromotion,
      );
    } else if (OrderItemPackage) {
      // Map to OrderItemPackageDomain
      orderItemDomain.item = new OrderItemPackageDomain();
      orderItemDomain.item.id = OrderItemPackage.id;
      orderItemDomain.item.package = OrderItemPackage.package;
    }
    return orderItemDomain;
  }
}
