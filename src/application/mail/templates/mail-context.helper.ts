import { CategoryDomain } from '@resources/category/domain/category.domain';
import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';
import { OwnerDomain } from '@resources/owner/domain/owner.domain';
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
    rewardVoucher?: OrderItemDomain['detail'];
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
    let reward: boolean = false;
    let rewardImg: string;
    if (!ObjectHelper.isObjectEmpty(rewardVoucher)) {
      reward = rewardVoucher?.package?.reward;
      rewardImg = rewardVoucher.img;
    }

    const { date, time } =
      DateFormatterService.formatToLocalDateAndAndMinusOneMinute(expiredDate);
    const numberAndTotal = `${countNumber} / ${total}`;

    return {
      owner_name: ownerName,
      app_name: appName,
      item_name: itemName,
      item_img: rewardImg ?? itemImg,
      item_code: itemCode,
      qrcode_path: qrcodePath,
      qrcode_url: qrcodeUrl,
      expired_date: date,
      expired_time: time,
      reward_voucher: reward,
      number_total: numberAndTotal,
      voucher_category: category,
    };
  }
}
