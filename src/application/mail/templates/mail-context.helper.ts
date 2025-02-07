import { CategoryDomain } from '@resources/category/domain/category.domain';
import {
  OrderItemDetails,
  OrderItemDomain,
} from '@resources/order-item/domain/order-item.domain';
import { OwnerDomain } from '@resources/owner/domain/owner.domain';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { DateFormatterService } from '@utils/services/date-formatter.service';
import { ObjectHelper } from '@utils/services/object.helper';

export class HandleBarContextHelper {
  public static orderItem(param: {
    ownerName: OwnerDomain['name'];
    itemName: OrderItemDomain['detail']['title'];
    appName: string;
    itemImg: string;
    itemCode: OrderItemDomain['code'];
    qrcodePath: OrderItemDomain['qrcodeImagePath'];
    qrcodeUrl: string;
    expiredDate: OrderItemDomain['usableExpiredAt'];
    countNumber: number;
    total: number;
    category: CategoryDomain['name'];
    package?: OrderItemDetails['package'];
  }): Record<string, unknown> {
    const {
      ownerName,
      appName,
      itemName,
      itemImg,
      itemCode,
      qrcodePath,
      qrcodeUrl,
      expiredDate,
      countNumber,
      total,
      category,
    } = param;

    const requiredFields = [
      'ownerName',
      'appName',
      'itemName',
      'itemImg',
      'itemCode',
      'qrcodePath',
      'qrcodeUrl',
      'expiredDate',
      'countNumber',
      'total',
      'category',
    ];

    ObjectHelper.findEmptyFieldAndThrowError(
      param,
      requiredFields,
      `${itemName} in prepare-context for sending email.`,
    );

    /**
     *
     * In sending email part, voucher title need to be sent in every case,
     * if the order-item is package, package title will be sent as well.
     *
     * If the orderItem is a package annd it's quota voucher,
     * the package image will be sent as the image,
     * but if it's reward voucher, need to check first whether the reward
     * has their own image, if not, use the voucher image instead.
     * for the category, use the voucher category as it's separate from the package.
     */

    let isRewardVoucher: boolean;
    let isPackage: boolean = false;
    let packageTitle: PackageVoucherDomain['title'];

    if (!ObjectHelper.isObjectEmpty(param.package)) {
      const { title, quotaVoucher, rewardVoucher } = param.package;
      isPackage = true;
      packageTitle = title;

      if (!ObjectHelper.isObjectEmpty(quotaVoucher)) {
        isRewardVoucher = false;
      } else if (!ObjectHelper.isObjectEmpty(rewardVoucher)) {
        isRewardVoucher = true;
      }
    }

    const { date, time } =
      DateFormatterService.formatToLocalDateAndAndMinusOneMinute(expiredDate);
    const numberAndTotal = `${countNumber} / ${total}`;

    return {
      owner_name: ownerName,
      app_name: appName,
      item_name: itemName,
      item_img: itemImg,
      item_code: itemCode,
      qrcode_path: qrcodePath,
      qrcode_url: qrcodeUrl,
      expired_date: date,
      expired_time: time,
      reward_voucher: isRewardVoucher,
      number_total: numberAndTotal,
      voucher_category: category,
      package_voucher: isPackage,
      package_title: packageTitle,
    };
  }
}
