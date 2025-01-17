import {
  OrderItem,
  OrderItemPackage,
  OrderItemPromotion,
  OrderItemVoucher,
  PackageVoucher,
  Voucher,
  VoucherPromotion,
} from '@prisma/client';
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

export type OrderItemAndDetails = OrderItem & {
  OrderItemVoucher?: OrderItemVoucher & {
    voucher?: Voucher;
  };
  OrderItemPromotion?: OrderItemPromotion & {
    voucherPromotion?: VoucherPromotion;
  };
  OrderItemPackage?: OrderItemPackage & {
    package?: PackageVoucher;
  };
};

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
    if (!orderItemEntity || Object.keys(orderItemEntity).length === 0)
      return null;

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
