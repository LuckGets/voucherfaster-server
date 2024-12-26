import {
  Voucher,
  VoucherImg,
  VoucherTermAndCondEN,
  VoucherTermAndCondTh,
} from '@prisma/client';
import {
  VoucherDomain,
  VoucherStatusEnum,
} from '@resources/voucher/domain/voucher.domain';

type AllVoucherInformation = Voucher & {
  VoucherTermAndCondEN?: Partial<VoucherTermAndCondEN>[];
  VoucherTermAndCondTh?: Partial<VoucherTermAndCondTh>[];
  VoucherImg?: Partial<VoucherImg>[];
};

export class VoucherMapper {
  public static toDomain(voucherEntity: AllVoucherInformation): VoucherDomain {
    const voucherDomain = new VoucherDomain();
    voucherDomain.id = voucherEntity.id;
    voucherDomain.code = voucherEntity.code;
    voucherDomain.description = voucherEntity.description;
    voucherDomain.price = voucherEntity.price.toNumber();
    voucherDomain.saleExpiredTime = voucherEntity.saleExpiredTime;
    voucherDomain.title = voucherEntity.title;
    voucherDomain.usageExpiredTime = voucherEntity.usageExpiredTime;
    voucherDomain.status = VoucherStatusEnum[voucherEntity.status];
    if (voucherEntity.VoucherImg) {
      voucherDomain.img = voucherEntity.VoucherImg.map((item) => {
        const img: VoucherDomain['img'][0] = {
          imgPath: item.imgPath,
          mainImg: item.mainImg,
        };
        if (item.createdAt && item.updatedAt) {
          img.createdAt = item.createdAt;
          img.updatedAt = item.updatedAt;
        }
        return img;
      });
    }
    if (
      voucherEntity.VoucherTermAndCondEN &&
      voucherEntity.VoucherTermAndCondTh
    ) {
      voucherDomain.termAndCond = {
        th: voucherEntity.VoucherTermAndCondTh.map((item) => item.description),
        en: voucherEntity.VoucherTermAndCondEN.map((item) => item.description),
      };
    }
    return voucherDomain;
  }
}
