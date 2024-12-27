import {
  Voucher,
  VoucherCategory,
  VoucherImg,
  VoucherTag,
  VoucherTermAndCondEN,
  VoucherTermAndCondTh,
} from '@prisma/client';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherStatusEnum,
  VoucherTagDomain,
} from '@resources/voucher/domain/voucher.domain';
import { plainToInstance } from 'class-transformer';

type AllVoucherInformation = Voucher & {
  VoucherTermAndCondEN?: Partial<VoucherTermAndCondEN>[];
  VoucherTermAndCondTh?: Partial<VoucherTermAndCondTh>[];
  VoucherImg?: Partial<VoucherImg>[];
};

type VoucherCategoryInformation = VoucherCategory & {
  VoucherTag?: Pick<
    VoucherTagDomain,
    'id' | 'name' | 'categoryId' | 'createdAt' | 'updatedAt'
  >[];
};

// type VoucherPromotionInformation = VoucherPromotion

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
          id: item.id,
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

export class VoucherCategoryMapper {
  public static toDomain(
    voucherCategoryEntity: VoucherCategoryInformation,
  ): VoucherCategoryDomain {
    const voucherCategoryDomain: VoucherCategoryDomain = plainToInstance(
      VoucherCategoryDomain,
      voucherCategoryEntity,
    );
    if (voucherCategoryEntity.VoucherTag) {
      voucherCategoryDomain.voucherTags = voucherCategoryEntity.VoucherTag;
    }
    return voucherCategoryDomain;
  }
}

export class VoucherPromotionMapper {
  public static toDomain() {}
}
