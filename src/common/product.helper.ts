import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { ProductTypeEnum } from './types/product.type';
import { Injectable } from '@nestjs/common';
import { VoucherDiscountDomain } from '@resources/voucher/domain/voucher-discount.domain';
import { PackageDiscountDomain } from '@resources/package/domain/package-discount.domain';

export type ProductDomain = VoucherDomain | PackageVoucherDomain;
export interface IDateDataToCheck {
  usableAt?: Date;
  usableExpiredAt?: Date;
  sellStartedAt?: Date;
  sellExpiredAt?: Date;
}

export interface IUpdateDataToCheck {
  title?: VoucherDomain['title'] | PackageVoucherDomain['title'];
  description?: VoucherDomain['description'];
  price?: VoucherDomain['price'] | PackageVoucherDomain['price'];
  discount?: {
    discountedPrice?:
      | VoucherDiscountDomain['discountedPrice']
      | PackageDiscountDomain['discountedPrice'];
    status?: VoucherDiscountDomain['status'] | PackageDiscountDomain['status'];
  };
  stockAmount?: number;
  status?: VoucherDomain['status'] | PackageVoucherDomain['status'];
}

@Injectable()
export class ProductDomainHelper {
  public checkUsableAndSellTime(
    data: IDateDataToCheck,
    productDomain: ProductDomain,
    productType: ProductTypeEnum,
  ): void {
    // If the request data want to change the promotion start selling Date
    // should check with the existing promotion date first.
    // if greater, than it could not proceed any further.
    if (data.sellStartedAt) {
      if (data.sellStartedAt === new Date(productDomain.sellStartedAt))
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} updated start-selling date :: ${data.sellStartedAt.toLocaleString()} is the same as existing stop-selling date: ${productDomain.sellExpiredAt}`,
        );

      if (data.sellStartedAt > new Date(productDomain.sellExpiredAt))
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} start-selling date :: ${data.sellStartedAt.toLocaleString()} should not be greater than the existing stop-selling date: ${productDomain.sellExpiredAt}`,
        );

      if (data.sellStartedAt > new Date(productDomain.usableAt))
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} start-selling date :: ${data.sellStartedAt.toLocaleString()} should not be greater than the existing usable date: ${productDomain.sellExpiredAt}`,
        );
    }

    // If the request data want to change the promotion start selling date and stop selling date
    // should check together if start-selling is greater or not.
    // if greater, than it could not proceed any further.
    if (data.sellStartedAt && data.sellExpiredAt) {
      if (data.sellStartedAt > data.sellExpiredAt) {
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} start-selling date :: ${data.sellStartedAt.toLocaleString()} should not be greater than the ${productType} stop-selling date: ${data.sellExpiredAt.toLocaleString()}`,
        );
      }
    }

    if (data.sellExpiredAt) {
      if (data.sellExpiredAt === new Date(productDomain.sellExpiredAt))
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} stop-selling date :: ${data.sellExpiredAt.toLocaleString()} is the same as the existing stop-selling date: ${productDomain.sellStartedAt}`,
        );

      if (data.sellExpiredAt < new Date(productDomain.sellStartedAt)) {
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} stop-selling date :: ${data.sellExpiredAt.toLocaleString()} should not be earlier than the existing start date: ${productDomain.sellStartedAt}`,
        );
      }

      if (data.sellExpiredAt > new Date(productDomain.usableAt)) {
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} stop-selling date :: ${data.sellExpiredAt.toLocaleString()} should not be earlier than the existing usable date: ${productDomain.usableAt}`,
        );
      }
      if (data.sellExpiredAt > new Date(productDomain.usableExpiredAt)) {
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} stop-selling date :: ${data.sellExpiredAt.toLocaleString()} should not be earlier than the existing expired-usable date: ${productDomain.usableExpiredAt}`,
        );
      }
    }

    if (data.usableAt) {
      if (data.usableAt < new Date(productDomain.sellStartedAt)) {
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} usable date :: ${data.usableAt.toLocaleString()} should not be earlier than the start selling date: ${productDomain.sellStartedAt}`,
        );
      }

      if (data.usableAt > new Date(productDomain.usableExpiredAt))
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} usable date :: ${data.usableAt.toLocaleString()} should not be greate than the existing expired-usable date: ${productDomain.usableExpiredAt}`,
        );
    }

    if (data.usableAt && data.usableExpiredAt) {
      if (data.usableAt === new Date(productDomain.sellExpiredAt))
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} update usable date :: ${data.sellExpiredAt.toLocaleString()} is the same as the existing usable date: ${productDomain.sellStartedAt}`,
        );

      if (data.usableAt > data.usableExpiredAt) {
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} :: ${data.usableAt.toLocaleString()} should not be greater than the usable expired date: ${data.usableExpiredAt.toLocaleString()}`,
        );
      }
    }

    if (data.usableExpiredAt) {
      if (data.usableExpiredAt === new Date(productDomain.usableExpiredAt))
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} update expired-usable date :: ${data.sellExpiredAt.toLocaleString()} is the same as the existing expired-usable date: ${productDomain.sellStartedAt}`,
        );
      if (data.usableExpiredAt < new Date(productDomain.usableAt)) {
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} usable expired date :: ${data.usableExpiredAt.toLocaleString()} should not be earlier than the existing usable date: ${productDomain.usableAt}`,
        );
      }
    }
  }

  public checkUpdateData(
    data: IUpdateDataToCheck,
    product: ProductDomain,
    productType: ProductTypeEnum,
  ) {
    if (ObjectHelper.isObjectEmpty(data)) return;

    if (data.status && product.status && data.status === product.status) {
      throw ErrorApiResponse.conflictRequest(
        `The updated status: ${data.status} is the same as existed ${productType} status: ${product.status}.`,
      );
    }

    const { discountedPrice, status } = data.discount;

    const neverHasDiscount = ObjectHelper.isObjectEmpty(product.discount);

    if (status) {
      if (neverHasDiscount) {
        throw ErrorApiResponse.conflictRequest(
          `The ${productType} ID: does not have created discount.`,
        );
      }
    }
    if (discountedPrice) {
      if (
        discountedPrice === product.price ||
        discountedPrice > product.price
      ) {
        throw ErrorApiResponse.conflictRequest(
          `The updated discounted price: ${discountedPrice} should not be equal or greater than ${productType} price: ${product.price}.`,
        );
      }

      if (!neverHasDiscount) {
        if (discountedPrice === product.discount.discountedPrice)
          throw ErrorApiResponse.conflictRequest(
            `The updated discounted price: ${discountedPrice} is the same as existed ${productType} discounted price: ${product.discount.discountedPrice}.`,
          );
      }
    }

    if (data.title && product.title && data.title === product.title) {
      throw ErrorApiResponse.conflictRequest(
        `The updated title: ${data.title} is the same as existed ${productType} title: ${product.title}.`,
      );
    }

    if (
      data.description &&
      product.description &&
      data.description === product.description
    ) {
      throw ErrorApiResponse.conflictRequest(
        `The updated description: ${data.description} is the same as existed ${productType} description : ${product.description}.`,
      );
    }

    if (
      data.stockAmount &&
      product.stockAmount &&
      data.stockAmount === product.stockAmount
    )
      throw ErrorApiResponse.conflictRequest(
        `The updated stock amount: ${data.stockAmount} is the same as existed ${productType} stock amount: ${product.stockAmount}.`,
      );
  }

  public checkDiscountAvailability(
    productDomain: ProductDomain,
    availableDiscountStatus: string,
  ): boolean {
    if (ObjectHelper.isObjectEmpty(productDomain.discount)) return false;

    if (productDomain.discount.status !== availableDiscountStatus) return false;

    if (productDomain.discount.deletedAt) return false;

    return true;
  }
}
