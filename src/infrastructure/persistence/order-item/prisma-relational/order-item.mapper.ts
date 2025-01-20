import {
  OrderItem,
  OrderItemPackage,
  OrderItemPromotion,
  OrderItemVoucher,
  PackageImg,
  PackageVoucher,
  Voucher,
  VoucherImg,
  VoucherPromotion,
} from '@prisma/client';
import {
  OrderItemDetails,
  OrderItemDomain,
  OrderItemPackageDomain,
  OrderItemPromotionDomain,
} from '@resources/order/domain/order-item.domain';
import { VoucherPromotionMapper } from '../../voucher/prisma-relational/voucher.mapper';
import { PackageVoucherMapper } from '../../package/prisma-relational/mapper/package.mapper';

export type OrderItemAndDetails = OrderItem & {
  OrderItemVoucher?: OrderItemVoucher & {
    voucher?: Voucher & {
      VoucherImg?: Partial<VoucherImg>;
    };
  };
  OrderItemPromotion?: OrderItemPromotion & {
    voucherPromotion?: VoucherPromotion & {
      VoucherImg?: Partial<VoucherImg>;
    };
  };
  OrderItemPackage?: OrderItemPackage & {
    package?: PackageVoucher & {
      PackageImg?: Partial<PackageImg>;
    };
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
    orderItemDomain.code = orderItem.code;
    orderItemDomain.redeemedAt = orderItem.redeemedAt;
    orderItemDomain.updatedAt = orderItem.updatedAt;

    if (OrderItemVoucher) {
      // Map to OrderItemVoucherDomain
      const orderItemDetail: OrderItemDetails = new OrderItemDetails();
      orderItemDetail.title = OrderItemVoucher.voucher.title;
      orderItemDetail.price = OrderItemVoucher.voucher.price.toNumber();
      orderItemDetail.usageExpiredTime =
        OrderItemVoucher.voucher.usageExpiredTime;
      orderItemDetail.img = OrderItemVoucher.voucher.VoucherImg;
      orderItemDomain.detail = orderItemDetail;
    } else if (OrderItemPromotion) {
      // Map to OrderItemPromotionDomain
      const orderItemDetail: OrderItemDetails = new OrderItemDetails();
      orderItemDetail.title = OrderItemPromotion.voucherPromotion?.name;
      orderItemDetail.price =
        OrderItemPromotion.voucherPromotion?.promotionPrice.toNumber();
      orderItemDetail.img = OrderItemPromotion.voucherPromotion?.VoucherImg;
      orderItemDetail.usageExpiredTime =
        OrderItemPromotion.voucherPromotion?.usableExpiredAt;

      orderItemDomain.detail = orderItemDetail;
    } else if (OrderItemPackage) {
      // Map to OrderItemPackageDomain
      const orderItemDetail: OrderItemDetails = new OrderItemDetails();
      orderItemDetail.title = OrderItemPackage.package?.title;
      orderItemDetail.price = OrderItemPackage.package?.packagePrice.toNumber();
      orderItemDetail.img = OrderItemPackage.package?.PackageImg;
      orderItemDetail.usageExpiredTime =
        OrderItemPackage.package?.usableExpiredAt;

      orderItemDomain.detail = orderItemDetail;
    }
    return orderItemDomain;
  }
}
