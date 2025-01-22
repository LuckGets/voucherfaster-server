import {
  OrderItem,
  OrderItemPackage,
  OrderItemPromotion,
  OrderItemVoucher,
  PackageImg,
  PackageRewardVoucher,
  PackageVoucher,
  Voucher,
  VoucherCategory,
  VoucherImg,
  VoucherPromotion,
  VoucherTag,
} from '@prisma/client';
import {
  OrderItemDetails,
  OrderItemDomain,
  OrderItemPackageDomain,
  OrderItemPromotionDomain,
} from '@resources/order/domain/order-item.domain';
import { VoucherPromotionMapper } from '../../voucher/prisma-relational/voucher.mapper';
import { PackageVoucherMapper } from '../../package/prisma-relational/mapper/package.mapper';
import { ObjectHelper } from '@utils/services/object.helper';

type NestedVoucherTagAndCategory = Partial<VoucherTag> & {
  voucherCategory?: Partial<VoucherCategory>;
};

type VoucherDetailAndImg = Voucher & {
  VoucherImg?: Partial<VoucherImg>;
  voucherTag?: NestedVoucherTagAndCategory;
};

export type OrderItemAndDetails = OrderItem & {
  OrderItemVoucher?: OrderItemVoucher & {
    voucher?: VoucherDetailAndImg;
  };
  OrderItemPromotion?: OrderItemPromotion & {
    voucherPromotion?: VoucherPromotion & {
      voucher?: VoucherDetailAndImg;
    };
  };
  OrderItemPackage?: OrderItemPackage & {
    package?: PackageVoucher & {
      voucher?: VoucherDetailAndImg;
      PackageImg?: Partial<PackageImg>;
      PackageRewardVoucher?: Partial<PackageRewardVoucher> & {
        voucher?: VoucherDetailAndImg;
      };
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
      // Map to OrderItemVoucher
      orderItemDomain.detail =
        OrderItemVoucherMapper.toDomain(OrderItemVoucher);
    } else if (OrderItemPromotion) {
      // Map to OrderItemPromotion
      orderItemDomain.detail =
        OrderItemPromotionMapper.toDomain(OrderItemPromotion);
    } else if (OrderItemPackage) {
      // Map to OrderItemPackageDomain
      orderItemDomain.detail =
        OrderItemPackageMapper.toDomain(OrderItemPackage);
    }
    return orderItemDomain;
  }
}

export class OrderItemVoucherMapper {
  /**
   * Maps an entity containing order item voucher data to an
   * OrderItemVoucherDomain domain object.
   *
   * @param {OrderItemAndDetails["OrderItemVoucher"]} orderItemVoucher - The entity object containing
   * order item voucher data.
   * @returns {OrderItemDetails} The domain object representing the order item
   */
  public static toDomain(
    orderItemVoucher: OrderItemAndDetails['OrderItemVoucher'],
  ) {
    const requiredFields: string[] =
      OrderItemDetails.getVoucherRequiredFields();
    const orderItemDetail: OrderItemDetails = new OrderItemDetails();
    if (ObjectHelper.isObjectEmpty(orderItemVoucher.voucher))
      throw new Error(
        `Voucher detail for order-item ID: ${orderItemVoucher.id} is empty.`,
      );

    // Map all required fields
    orderItemDetail.id = orderItemVoucher.voucher.id;
    orderItemDetail.title = orderItemVoucher.voucher.title;
    orderItemDetail.price = orderItemVoucher.voucher.price.toNumber();
    orderItemDetail.usableExpiredAt = orderItemVoucher.voucher.usableExpiredAt;

    // Map additional fields
    if (ObjectHelper.isObjectEmpty(orderItemVoucher.voucher.VoucherImg))
      throw new Error(`VoucherImg is empty`);
    orderItemDetail.img = orderItemVoucher.voucher.VoucherImg?.imgPath;

    // Map additional fields
    orderItemDetail.category =
      orderItemVoucher.voucher.voucherTag.voucherCategory.name;
    orderItemDetail.promotion = null;
    orderItemDetail.package = null;

    // Check for missing fields
    ObjectHelper.findEmptyFieldAndThrowError(
      orderItemDetail,
      requiredFields,
      orderItemVoucher.id,
    );
    return orderItemDetail;
  }
}

export class OrderItemPromotionMapper {
  /**
   * Maps an entity containing order item promotion data to an
   * OrderItemPromotionDomain domain object.
   *
   * @param {OrderItemAndDetails["OrderItemPromotion"]} orderItemPromotion - The entity object containing
   * order item promotion data.
   * @returns {OrderItemDetails} The domain object representing the order item
   * promotion and its associated voucher.
   */
  public static toDomain(
    orderItemPromotion: OrderItemAndDetails['OrderItemPromotion'],
  ) {
    const requiredFields = OrderItemDetails.getPromotionRequiredFields();

    const orderItemDetail: OrderItemDetails = new OrderItemDetails();
    // Check if the order item promotion data is empty
    if (ObjectHelper.isObjectEmpty(orderItemPromotion.voucherPromotion)) {
      throw new Error(
        `Voucher detail for order-item ID: ${orderItemPromotion.id} is empty.`,
      );
    }

    // Map the voucher promotion data to the order item detail
    orderItemDetail.id = orderItemPromotion.voucherPromotionId;
    orderItemDetail.title = orderItemPromotion.voucherPromotion?.voucher.title;
    orderItemDetail.price =
      orderItemPromotion.voucherPromotion?.promotionPrice.toNumber();
    orderItemDetail.usableExpiredAt =
      orderItemPromotion.voucherPromotion?.usableExpiredAt;

    // Check if the voucher image is empty
    if (
      ObjectHelper.isObjectEmpty(
        orderItemPromotion.voucherPromotion?.voucher?.VoucherImg,
      )
    ) {
      throw new Error(`VoucherImg is empty`);
    }

    // Map the voucher image
    orderItemDetail.img =
      orderItemPromotion.voucherPromotion?.voucher?.VoucherImg?.imgPath;

    // Map the category
    orderItemDetail.category =
      orderItemPromotion.voucherPromotion?.voucher?.voucherTag?.voucherCategory?.name;

    // Map the promotion
    orderItemDetail.promotion.name = orderItemPromotion.voucherPromotion?.name;

    // Check for missing fields
    ObjectHelper.findEmptyFieldAndThrowError(
      orderItemDetail,
      requiredFields,
      orderItemPromotion.id,
    );

    return orderItemDetail;
  }
}

export class OrderItemPackageMapper {
  /**
   * Maps an OrderItemPackage entity to an OrderItemDetails domain object.
   *
   * @param {OrderItemAndDetails['OrderItemPackage']} orderItemPackage - The entity object containing order item package data.
   * @returns {OrderItemDetails} The domain object representing the order item package.
   * @throws Will throw an error if required fields are empty.
   */
  public static toDomain(
    orderItemPackage: OrderItemAndDetails['OrderItemPackage'],
  ): OrderItemDetails {
    const requiredFields = OrderItemDetails.getPackageRequiredFields();

    // Validate if the package data is present
    if (ObjectHelper.isObjectEmpty(orderItemPackage.package)) {
      throw new Error(
        `Voucher detail for order-item ID: ${orderItemPackage.id} is empty.`,
      );
    }

    const orderItemDetail = new OrderItemDetails();
    // Map the id and package details
    orderItemDetail.id = orderItemPackage.voucherId;
    orderItemDetail.package.name = orderItemPackage.package.title;
    orderItemDetail.package.reward = orderItemPackage.rewardVoucher;

    // Determine title and category based on reward voucher presence
    if (orderItemPackage.rewardVoucher) {
      orderItemDetail.title =
        orderItemPackage.package.PackageRewardVoucher.voucher.title;
      orderItemDetail.category =
        orderItemPackage.package.PackageRewardVoucher.voucher.voucherTag.voucherCategory.name;
    } else {
      orderItemDetail.title = orderItemPackage.package.voucher.title;
      orderItemDetail.category =
        orderItemPackage.package.voucher.voucherTag.voucherCategory.name;
    }

    // Map price and usage expiration time
    orderItemDetail.price = orderItemPackage.package.packagePrice.toNumber();
    orderItemDetail.usableExpiredAt = orderItemPackage.package.usableExpiredAt;

    // Validate and map the image path
    if (ObjectHelper.isObjectEmpty(orderItemPackage.package.PackageImg)) {
      throw new Error(`PackageImg is empty`);
    }
    orderItemDetail.img = orderItemPackage.package.PackageImg?.imgPath;

    // Check for any missing required fields
    ObjectHelper.findEmptyFieldAndThrowError(
      orderItemDetail,
      requiredFields,
      orderItemPackage.package.id,
    );

    return orderItemDetail;
  }
}
