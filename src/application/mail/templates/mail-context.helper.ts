import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { OwnerDomain } from '@resources/owner/domain/owner.domain';
import { VoucherCategoryDomain } from '@resources/voucher/domain/voucher.domain';
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
    expiredDate: Date;
    countNumber: number;
    total: number;
    category: VoucherCategoryDomain['name'];
    promotion?: OrderItemDomain['detail']['promotion'];
    rewardVoucher?: OrderItemDomain['detail']['package']['reward'];
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
      promotion,
      rewardVoucher,
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

    const reward: boolean = rewardVoucher ? true : false;
    let isPromotion: boolean = false;
    let _promotionName = '';
    if (promotion && Object.keys(promotion).length > 0) {
      if (!promotion.name) throw new Error('Promotion name is required');
      isPromotion = true;
      _promotionName = promotion.name;
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
      reward_voucher: reward,
      number_total: numberAndTotal,
      promotion_voucher: isPromotion,
      promotion_name: _promotionName,
      voucher_category: category,
    };
  }
}
