import {
  Voucher,
  VoucherCategory,
  VoucherImg,
  VoucherPromotion,
  VoucherTag,
  VoucherTermAndCondEN,
  VoucherTermAndCondTh,
} from '@prisma/client';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherStatusEnum,
  VoucherTagDomain,
  VoucherTermAndCondDomain,
} from '@resources/voucher/domain/voucher.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import { plainToInstance } from 'class-transformer';

type AllVoucherInformation = Voucher & {
  VoucherTermAndCondEN?: Partial<VoucherTermAndCondEN>[];
  VoucherTermAndCondTh?: Partial<VoucherTermAndCondTh>[];
  VoucherImg?: Partial<VoucherImg>[];
  VoucherPromotion?: Partial<VoucherPromotion>[];
  voucherTag?: Partial<VoucherTag> & {
    voucherCategory?: Partial<VoucherCategory>;
  };
};

type VoucherCategoryInformation = VoucherCategory & {
  VoucherTags?: Pick<
    VoucherTagDomain,
    'id' | 'name' | 'categoryId' | 'createdAt' | 'updatedAt'
  >[];
};

// type VoucherPromotionInformation = VoucherPromotion

export class VoucherMapper {
  public static toDomain(
    voucherEntity: AllVoucherInformation,
    options: { allInfo: boolean },
  ): VoucherDomain {
    const voucherDomain = new VoucherDomain();

    if (ObjectHelper.isObjectEmpty(voucherEntity)) return null;

    if (ObjectHelper.isObjectEmpty(voucherEntity.voucherTag))
      throw new Error(`VoucherTag is empty in voucher ID: ${voucherEntity.id}`);
    if (ObjectHelper.isObjectEmpty(voucherEntity.voucherTag.voucherCategory))
      throw new Error(
        `Voucher category is empty in voucher ID: ${voucherEntity.id}`,
      );
    if (voucherEntity.VoucherImg.length === 0)
      throw new Error(
        `Voucher image is empty in voucher ID: ${voucherEntity.id}`,
      );

    voucherDomain.id = voucherEntity.id;
    voucherDomain.stockAmount = voucherEntity.stockAmount;
    voucherDomain.description = voucherEntity.description;
    voucherDomain.price = voucherEntity.price.toNumber();
    voucherDomain.sellExpiredAt = voucherEntity.sellExpiredAt;
    voucherDomain.title = voucherEntity.title;
    voucherDomain.usableExpiredAt = voucherEntity.usableExpiredAt;
    voucherDomain.status = VoucherStatusEnum[voucherEntity.status];

    voucherDomain.tag = voucherEntity.voucherTag.name;
    voucherDomain.category = voucherEntity.voucherTag.voucherCategory.name;

    voucherDomain.img = voucherEntity.VoucherImg.map((item) => {
      const img: VoucherDomain['img'][0] = { ...item };
      return img;
    });
    if (
      voucherEntity.VoucherTermAndCondEN &&
      voucherEntity.VoucherTermAndCondTh
    ) {
      voucherDomain.termAndCond = {
        th: voucherEntity.VoucherTermAndCondTh.map((item) => {
          const termAndCond = new VoucherTermAndCondDomain();
          termAndCond.id = item.id;
          termAndCond.description = item.description;
          return termAndCond;
        }),
        en: voucherEntity.VoucherTermAndCondEN.map((item) => {
          const termAndCond = new VoucherTermAndCondDomain();
          termAndCond.id = item.id;
          termAndCond.description = item.description;
          return termAndCond;
        }),
      };
    }
    if (
      voucherEntity.VoucherPromotion &&
      voucherEntity.VoucherPromotion.length > 0
    ) {
      voucherDomain.promotion = voucherEntity.VoucherPromotion.map(
        VoucherPromotionMapper.toDomain,
      );
    } else {
      voucherDomain.promotion = [];
    }

    if (options.allInfo) {
      ObjectHelper.findEmptyFieldAndThrowError(
        voucherDomain,
        VoucherDomain.requiredFieldForDetail(),
        'Voucher',
      );
    } else if (!options.allInfo) {
      ObjectHelper.findEmptyFieldAndThrowError(
        voucherDomain,
        VoucherDomain.requiredFieldForList(),
        'Voucher',
      );
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
      { excludeExtraneousValues: true },
    );

    if (voucherCategoryEntity.VoucherTags) {
      voucherCategoryDomain.voucherTags = [
        ...voucherCategoryEntity.VoucherTags,
      ];
    }
    return voucherCategoryDomain;
  }
}

export class VoucherPromotionMapper {
  public static toDomain(
    voucherPromotionEntity: VoucherPromotion,
  ): VoucherPromotionDomain {
    if (!voucherPromotionEntity) return null;
    const voucherPromotionDomain = new VoucherPromotionDomain();
    voucherPromotionDomain.id = voucherPromotionEntity.id;
    voucherPromotionDomain.name = voucherPromotionEntity.name;
    voucherPromotionDomain.stockAmount = voucherPromotionEntity.stockAmount;
    voucherPromotionDomain.sellStartedAt = voucherPromotionEntity.sellStartedAt;
    voucherPromotionDomain.sellExpiredAt = voucherPromotionEntity.sellExpiredAt;
    voucherPromotionDomain.usableAt = voucherPromotionEntity.usableAt;
    voucherPromotionDomain.usableExpiredAt =
      voucherPromotionEntity.usableExpiredAt;
    voucherPromotionDomain.promotionPrice =
      voucherPromotionEntity.promotionPrice.toNumber();
    if (voucherPromotionEntity.createdAt && voucherPromotionEntity.updatedAt) {
      voucherPromotionDomain.createdAt = voucherPromotionEntity.createdAt;
      voucherPromotionDomain.updatedAt = voucherPromotionEntity.updatedAt;
    }
    if (voucherPromotionEntity.deletedAt)
      voucherPromotionDomain.deletedAt = voucherPromotionEntity.deletedAt;
    return voucherPromotionDomain;
  }
}

export class VoucherTermAndCondMapper {
  public static toDomain(
    termAndCondEntity: VoucherTermAndCondEN | VoucherTermAndCondTh,
  ): VoucherTermAndCondDomain {
    const termAndCondDomain = new VoucherTermAndCondDomain();
    termAndCondDomain.id = termAndCondEntity.id;
    termAndCondDomain.description = termAndCondEntity.description;
    termAndCondDomain.voucherId = termAndCondEntity.voucherId;
    termAndCondDomain.createdAt = termAndCondEntity.createdAt;
    termAndCondDomain.updatedAt = termAndCondEntity.updatedAt;
    termAndCondDomain.inactiveAt = termAndCondEntity.inactiveAt;
    return termAndCondDomain;
  }
}
