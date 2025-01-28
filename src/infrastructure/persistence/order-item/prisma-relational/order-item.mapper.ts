import {
  OrderItem,
  OrderItemPackage,
  OrderItemPromotion,
  OrderItemVoucher,
  PackageImg,
  PackageRewardVoucher,
  PackageVoucher,
  RedeemedOrderItem,
  Voucher,
  VoucherCategory,
  VoucherImg,
  VoucherPromotion,
  VoucherTag,
} from '@prisma/client';
import {
  OrderItemDetailPackageField,
  OrderItemDetailPromotionField,
  OrderItemDetails,
  OrderItemDomain,
} from '@resources/order-item/domain/order-item.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import {
  AllOrderInformation,
  OrderMapper,
} from '../../order/prisma-relational/order.mapper';

type NestedVoucherTagAndCategory = Partial<VoucherTag> & {
  voucherCategory: Partial<VoucherCategory>;
};

type VoucherDetailAndImg = Voucher & {
  VoucherImg: Partial<VoucherImg>[];
  voucherTag: NestedVoucherTagAndCategory;
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
      PackageImg?: Partial<PackageImg>[];
      PackageRewardVoucher?: (Partial<PackageRewardVoucher> & {
        voucher?: VoucherDetailAndImg;
      })[];
    };
  };
  order?: Omit<AllOrderInformation, 'OrderItem'>;
  RedeemOrderItem?: Partial<RedeemedOrderItem>;
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
    options: { allInfo: boolean } = { allInfo: false },
  ): OrderItemDomain {
    if (!orderItemEntity || Object.keys(orderItemEntity).length === 0)
      return null;

    const {
      OrderItemVoucher,
      OrderItemPromotion,
      OrderItemPackage,
      order,
      ...orderItem
    } = orderItemEntity;
    const orderItemDomain = new OrderItemDomain();
    orderItemDomain.id = orderItem.id;
    orderItemDomain.qrcodeImagePath = orderItem.qrcodeImgPath;
    orderItemDomain.code = orderItem.code;

    const { RedeemOrderItem } = orderItem;

    let redeemOrderItem = RedeemOrderItem;

    if (Array.isArray(RedeemOrderItem) && RedeemOrderItem.length > 0)
      redeemOrderItem = RedeemOrderItem[0];

    if (ObjectHelper.isObjectEmpty(redeemOrderItem)) {
      orderItemDomain.redeemedAt = null;
    } else {
      orderItemDomain.redeemedAt = redeemOrderItem.updatedAt.toLocaleString();
    }

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

    if (!ObjectHelper.isObjectEmpty(order) && options.allInfo) {
      orderItemDomain.order = OrderMapper.toDomain(order);
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
    const orderItemDetail: OrderItemDetails = new OrderItemDetails();
    if (ObjectHelper.isObjectEmpty(orderItemVoucher.voucher))
      throw new Error(
        `Voucher detail for order-item ID: ${orderItemVoucher.id} is empty.`,
      );

    // Map all required fields
    orderItemDetail.voucherId = orderItemVoucher.voucher.id;
    orderItemDetail.title = orderItemVoucher.voucher.title;
    orderItemDetail.price = orderItemVoucher.voucher.price.toNumber();
    orderItemDetail.usableExpiredAt = orderItemVoucher.voucher.usableExpiredAt;

    // Map additional fields
    if (ObjectHelper.isObjectEmpty(orderItemVoucher.voucher.VoucherImg))
      throw new Error(`VoucherImg is empty`);
    orderItemDetail.img = orderItemVoucher.voucher.VoucherImg?.filter(
      (item) => item.mainImg === true,
    )[0].imgPath;

    // Map additional fields
    orderItemDetail.category =
      orderItemVoucher.voucher.voucherTag.voucherCategory.name;
    orderItemDetail.promotion = null;
    orderItemDetail.package = null;

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
    orderItemDetail.voucherId = orderItemPromotion.voucherPromotion?.voucher.id;
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
      orderItemPromotion.voucherPromotion?.voucher?.VoucherImg?.filter(
        (item) => item.mainImg === true,
      )[0].imgPath;

    // Map the category
    orderItemDetail.category =
      orderItemPromotion.voucherPromotion?.voucher?.voucherTag?.voucherCategory?.name;

    // Map the promotion
    const promotionField: OrderItemDetailPromotionField = {
      promotionId: orderItemPromotion.voucherPromotionId,
      name: orderItemPromotion.voucherPromotion?.name,
    };
    orderItemDetail.promotion = { ...promotionField };

    // Check for missing fields
    ObjectHelper.findEmptyFieldAndThrowError(
      orderItemDetail,
      requiredFields,
      orderItemPromotion.voucherPromotion.name,
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
    const { rewardVoucher } = orderItemPackage;

    const orderItemDetail = new OrderItemDetails();
    // Map the id and package details
    orderItemDetail.voucherId = orderItemPackage.voucherId;
    const packageField: OrderItemDetailPackageField = {
      packageId: orderItemPackage.packageId,
      name: orderItemPackage.package?.title,
      reward: rewardVoucher,
    };
    orderItemDetail.package = { ...packageField };

    // Determine title and category based on reward voucher presence
    if (rewardVoucher) {
      const { PackageRewardVoucher } = orderItemPackage.package;
      const rewardVoucherList = PackageRewardVoucher.filter((item) => {
        return item.rewardVoucherId === orderItemPackage.voucherId;
      });
      if (rewardVoucherList.length > 1) {
        throw new Error(
          `Multiple same reward vouchers ID: ${orderItemPackage.voucherId} found for order-item ID: ${orderItemPackage.id}`,
        );
      }
      const rewardVoucherInfo = rewardVoucherList[0];
      const { title, voucherTag } = rewardVoucherInfo.voucher;
      orderItemDetail.title = title;
      orderItemDetail.category = voucherTag.voucherCategory.name;
    } else {
      const { title, voucherTag } = orderItemPackage.package.voucher;
      orderItemDetail.title = title;
      orderItemDetail.category = voucherTag.voucherCategory.name;
    }

    const { price, usableExpiredAt, PackageImg, title } =
      orderItemPackage.package;

    // Map price and usage expiration time
    orderItemDetail.price = price.toNumber();
    orderItemDetail.usableExpiredAt = usableExpiredAt;

    // Validate and map the image path
    if (ObjectHelper.isObjectEmpty(PackageImg)) {
      throw new Error(
        `PackageImg in package ID: ${orderItemPackage.packageId} is empty`,
      );
    }
    orderItemDetail.img = PackageImg?.filter(
      (item) => item.mainImg === true,
    )[0].imgPath;

    // Check for any missing required fields
    ObjectHelper.findEmptyFieldAndThrowError(
      orderItemDetail,
      requiredFields,
      title,
    );

    return orderItemDetail;
  }
}
