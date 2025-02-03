import {
  Category,
  OrderItem,
  OrderItemPackage,
  OrderItemVoucher,
  PackageDiscount,
  PackageImg,
  PackageRewardVoucher,
  PackageVoucher,
  RedeemedOrderItem,
  Voucher,
  VoucherDiscount,
  VoucherImg,
  VoucherTag,
} from '@prisma/client';
import {
  OrderItemDetailPackageField,
  OrderItemDetails,
  OrderItemDomain,
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

export type OrderItemAndDetails = OrderItem & {
  OrderItemVoucher?: OrderItemVoucher & {
    voucher?: VoucherDetailAndImg;
    VoucherDiscount?: Partial<VoucherDiscount>;
  };
  OrderItemPackage?: OrderItemPackage & {
    package?: PackageVoucher & {
      voucher?: VoucherDetailAndImg;
      PackageImg?: Partial<PackageImg>[];
      PackageRewardVoucher?: (Partial<PackageRewardVoucher> & {
        voucher?: VoucherDetailAndImg;
      })[];
    };
    PackageDiscount?: Partial<PackageDiscount>;
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

    const { OrderItemVoucher, OrderItemPackage, order, ...orderItem } =
      orderItemEntity;

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
    } else if (OrderItemPackage) {
      // Map to OrderItemPackageDomain
      detail = OrderItemPackageMapper.toDomain(OrderItemPackage);
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
  public static toDomain(
    orderItemPackage: OrderItemAndDetails['OrderItemPackage'],
  ): OrderItemDetails {
    const { rewardVoucher } = orderItemPackage;
    const { price, PackageImg } = orderItemPackage.package;

    // Validate if the package data is present
    if (ObjectHelper.isObjectEmpty(orderItemPackage.package)) {
      throw new Error(
        `Voucher detail for order-item ID: ${orderItemPackage.id} is empty.`,
      );
    }

    let packageImg = PackageImg.filter((item) => item.mainImg === true)[0]
      .imgPath;

    // Map the id and package details
    const packageField: OrderItemDetailPackageField = {
      packageId: orderItemPackage.packageId,
      name: orderItemPackage.package?.title,
      reward: rewardVoucher,
    };

    let voucherTitle = null;
    let categoryName = null;

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

      if (rewardVoucherInfo.img) {
        // Use the reward voucher image if present
        packageImg = rewardVoucherInfo.img;
      } else {
        packageImg = rewardVoucherInfo.voucher.VoucherImg.filter(
          (item) => item.mainImg === true,
        )[0].imgPath;
      }

      const { title, voucherTag } = rewardVoucherInfo.voucher;
      voucherTitle = title;
      categoryName = voucherTag.category.name;
    } else {
      const { title, voucherTag } = orderItemPackage.package.voucher;
      voucherTitle = title;
      categoryName = voucherTag.category.name;
    }

    // Map price and usage expiration time

    let packagePrice: number = price.toNumber();

    if (!ObjectHelper.isObjectEmpty(orderItemPackage?.PackageDiscount)) {
      packagePrice =
        orderItemPackage.PackageDiscount.discountedPrice.toNumber();
    }

    // Validate and map the image path
    if (ObjectHelper.isObjectEmpty(PackageImg)) {
      throw new Error(
        `PackageImg in package ID: ${orderItemPackage.packageId} is empty`,
      );
    }

    return new OrderItemDetails({
      category: categoryName,
      img: packageImg,
      price: packagePrice,
      title: voucherTitle,
      voucherId: orderItemPackage.voucherId,
      discountId: orderItemPackage.packageDiscountId ?? null,
      packageDetail: packageField,
    });
  }
}
