import {
  Category,
  OrderItem,
  OrderItemPackageQuota,
  OrderItemPackageReward,
  OrderItemVoucher,
  PackageDiscount,
  PackageImg,
  PackageQuotaVoucher,
  PackageRewardVoucher,
  PackageVoucher,
  RedeemedOrderItem,
  Voucher,
  VoucherDiscount,
  VoucherImg,
  VoucherTag,
} from '@prisma/client';
import {
  OrderItemDetails,
  OrderItemDomain,
  OrderItemPackageDetail,
} from '@resources/order-item/domain/order-item.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import {
  AllOrderInformation,
  OrderMapper,
} from '../../order/prisma-relational/order.mapper';

type NestedVoucherTagAndCategory = Partial<VoucherTag> & {
  category: Partial<Category>;
};

type VoucherDetailAndImg = Voucher & {
  VoucherImg: Partial<VoucherImg>[];
  voucherTag: NestedVoucherTagAndCategory;
};

type PackageDetail = Partial<PackageVoucher> & {
  PackageImg: Partial<PackageImg>[];
};

type PackageDiscountInfo = Partial<PackageDiscount>;

export type OrderItemAndDetails = OrderItem & {
  OrderItemVoucher?: OrderItemVoucher & {
    voucher?: VoucherDetailAndImg;
    VoucherDiscount?: Partial<VoucherDiscount>;
  };
  OrderItemPackageQuota?: Partial<OrderItemPackageQuota> & {
    packageQuotaVoucher?: Partial<PackageQuotaVoucher> & {
      voucher?: Voucher & {
        voucherTag: NestedVoucherTagAndCategory;
      };
      package?: PackageDetail;
    };
    PackageDiscount?: PackageDiscountInfo;
  };
  OrderItemPackageReward?: Partial<OrderItemPackageReward> & {
    packageRewardVoucher?: Partial<PackageRewardVoucher> & {
      voucher?: VoucherDetailAndImg;
      package?: PackageDetail;
    };
    PackageDiscount?: PackageDiscountInfo;
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
      OrderItemPackageQuota,
      OrderItemPackageReward,
      order,
      ...orderItem
    } = orderItemEntity;

    const { RedeemOrderItem } = orderItem;

    let redeemedAt = null;

    if (Array.isArray(RedeemOrderItem) && RedeemOrderItem.length > 0) {
      const [redeemOrderItem] = RedeemOrderItem;
      if (ObjectHelper.isObjectEmpty(redeemOrderItem)) {
        redeemedAt = null;
      } else {
        redeemedAt = redeemOrderItem.updatedAt.toLocaleString();
      }
    }

    let detail: OrderItemDomain['detail'] = null;

    if (OrderItemVoucher) {
      // Map to OrderItemVoucher
      detail = OrderItemVoucherMapper.toDomain(OrderItemVoucher);
    } else if (OrderItemPackageQuota) {
      // Map to OrderItemPackageQuotaDomain
      detail = OrderItemPackageMapper.toQuotaDomain(OrderItemPackageQuota);
    } else if (OrderItemPackageReward) {
      // Map to OrderItemPackageRewardDomain
      detail = OrderItemPackageMapper.toRewardDomain(OrderItemPackageReward);
    }

    let orderDetail: OrderItemDomain['order'] = null;

    if (!ObjectHelper.isObjectEmpty(order) && options.allInfo) {
      orderDetail = OrderMapper.toDomain(order);
    }
    return new OrderItemDomain({
      id: orderItem.id,
      qrcodeImagePath: orderItem.qrcodeImagePath,
      code: orderItem.code,
      order: orderDetail,
      usableAt: orderItem.usableAt,
      usableExpiredAt: orderItem.usableExpiredAt,
      redeemedAt,
      detail,
    });
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
  ): OrderItemDomain['detail'] {
    if (ObjectHelper.isObjectEmpty(orderItemVoucher.voucher))
      throw new Error(
        `Voucher detail for order-item ID: ${orderItemVoucher.id} is empty.`,
      );

    // Map additional fields
    const voucherImg = orderItemVoucher.voucher.VoucherImg?.filter(
      (item) => item.mainImg === true,
    )[0].imgPath;

    const categoryName = orderItemVoucher.voucher.voucherTag.category.name;
    const packageDetail = null;

    const discountId = orderItemVoucher.voucherDiscountId ?? null;

    let price: number = orderItemVoucher.voucher.price.toNumber();

    console.log('discount obj:', orderItemVoucher.VoucherDiscount);

    if (!ObjectHelper.isObjectEmpty(orderItemVoucher.VoucherDiscount)) {
      price = orderItemVoucher.VoucherDiscount.discountedPrice.toNumber();
    }

    return new OrderItemDetails({
      voucherId: orderItemVoucher.voucher.id,
      title: orderItemVoucher.voucher.title,
      price,
      category: categoryName,
      img: voucherImg,
      packageDetail,
      discountId,
    });
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
  public static toQuotaDomain(
    orderItemPackageQuota: OrderItemAndDetails['OrderItemPackageQuota'],
  ): OrderItemDetails {
    if (ObjectHelper.isObjectEmpty(orderItemPackageQuota)) {
      throw new Error(`Voucher detail for order-item is empty.`);
    }

    const {
      packageQuotaVoucherId,
      packageQuotaVoucher,
      packageDiscountId,
      PackageDiscount,
    } = orderItemPackageQuota;

    const {
      PackageImg,
      title,
      id,
      price: packagePrice,
    } = orderItemPackageQuota.packageQuotaVoucher.package;

    const { voucher, deletedAt } = packageQuotaVoucher;
    if (ObjectHelper.isObjectEmpty(voucher))
      throw new Error(
        `Detail about voucher in package --> ID : ${id} is missing.`,
      );

    const quotaVoucher: OrderItemPackageDetail['quotaVoucher'] = {
      id: packageQuotaVoucherId,
      deletedAt: deletedAt,
    }; // Validate if the package data is present

    const packageImg = PackageImg.filter((item) => item.mainImg === true)[0]
      .imgPath;

    // Map the id and package details
    const packageField: OrderItemPackageDetail = new OrderItemPackageDetail({
      packageId: id,
      title,
      quotaVoucher,
    });

    // Determine title and category based on reward voucher presence

    // Map price and usage expiration time

    let price: number = packagePrice.toNumber();

    if (packageDiscountId) {
      if (ObjectHelper.isObjectEmpty(PackageDiscount)) {
        throw new Error(
          `There is discount ID for package ID : ${id} but there is no detail.`,
        );
      }
      price = PackageDiscount.discountedPrice.toNumber();
    }

    return new OrderItemDetails({
      category: voucher.voucherTag?.category?.name,
      img: packageImg,
      price,
      title: voucher?.title,
      voucherId: voucher.id,
      discountId: packageDiscountId ?? null,
      packageDetail: packageField,
    });
  }

  public static toRewardDomain(
    orderItemPackageReward: OrderItemAndDetails['OrderItemPackageReward'],
  ): OrderItemDetails {
    if (ObjectHelper.isObjectEmpty(orderItemPackageReward)) {
      throw new Error(`Voucher detail for order-item is empty.`);
    }

    const {
      packageRewardVoucherId,
      packageRewardVoucher,
      packageDiscountId,
      PackageDiscount,
    } = orderItemPackageReward;

    const {
      title,
      id,
      price: packagePrice,
    } = orderItemPackageReward.packageRewardVoucher.package;

    const { voucher, deletedAt, img } = packageRewardVoucher;

    const rewardVoucher: OrderItemPackageDetail['rewardVoucher'] = {
      id: packageRewardVoucherId,
      deletedAt: deletedAt,
    };
    // Validate if the package data is present

    const packageImg =
      img ??
      voucher.VoucherImg.filter((item) => item.mainImg === true)[0].imgPath;

    // Map the id and package details
    const packageField: OrderItemPackageDetail = new OrderItemPackageDetail({
      packageId: id,
      title,
      rewardVoucher,
    });

    // Determine title and category based on reward voucher presence

    // Map price and usage expiration time

    let price: number = packagePrice.toNumber();

    if (packageDiscountId) {
      if (ObjectHelper.isObjectEmpty(PackageDiscount)) {
        throw new Error(
          `There is discount ID for package ID : ${id} but there is no detail.`,
        );
      }
      price = PackageDiscount.discountedPrice.toNumber();
    }

    return new OrderItemDetails({
      category: voucher.voucherTag?.category?.name,
      img: packageImg,
      price,
      title: voucher?.title,
      voucherId: voucher.id,
      discountId: packageDiscountId ?? null,
      packageDetail: packageField,
    });
  }
}
