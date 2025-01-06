import {
  PackageVoucher,
  Voucher,
  VoucherCategory,
  VoucherImg,
  VoucherPromotion,
  VoucherTermAndCondEN,
  VoucherTermAndCondTh,
} from '@prisma/client';
import { PackageVoucherDomain } from '@resources/voucher/domain/package-voucher.domain';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import {
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherStatusEnum,
  VoucherTagDomain,
} from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';
import { plainToInstance } from 'class-transformer';

type AllVoucherInformation = Voucher & {
  VoucherTermAndCondEN?: Partial<VoucherTermAndCondEN>[];
  VoucherTermAndCondTh?: Partial<VoucherTermAndCondTh>[];
  VoucherImg?: Partial<VoucherImg>[];
  VoucherPromotion?: Partial<VoucherPromotion>[];
};

type VoucherCategoryInformation = VoucherCategory & {
  VoucherTags?: Pick<
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
        const img: VoucherDomain['img'][0] = { ...item };
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
    if (
      voucherEntity.VoucherPromotion &&
      voucherEntity.VoucherPromotion.length > 0
    ) {
      voucherDomain.promotion = voucherEntity.VoucherPromotion.map(
        VoucherPromotionMapper.toDomain,
      );
    }
    return voucherDomain;
  }

  // public static separateVoucherAndPackageToDomain(
  //   voucherAndPackageEntity: (AllVoucherInformation & {
  //     PackageVoucher: Partial<PackageVoucher>[];
  //   })[],
  // ): {
  //   voucher: NullAble<VoucherDomain[]>;
  //   package: NullAble<PackageVoucherDomain[]>;
  // } {
  //   if (!voucherAndPackageEntity || voucherAndPackageEntity.length < 0)
  //     return { voucher: [], package: [] };
  //   const { mappedVoucherList, packageVoucher } =
  //     voucherAndPackageEntity.reduce(
  //       (acc, curr) => {
  //         const { PackageVoucher, ...data } = curr;
  //         if (PackageVoucher && PackageVoucher.length > 0) {
  //           acc.packageVoucher.push(PackageVoucher);
  //         }
  //         acc.mappedVoucherList.push(
  //           VoucherMapper.toDomain(data as AllVoucherInformation),
  //         );
  //         return acc;
  //       },
  //       {
  //         mappedVoucherList: [],
  //         packageVoucher: [],
  //       },
  //     );
  //   return { voucher: mappedVoucherList, package: packageVoucher };
  // }
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
