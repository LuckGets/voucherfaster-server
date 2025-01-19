import { Owner, OwnerImg } from '@prisma/client';
import {
  OwnerDomain,
  OwnerImgDomain,
  OwnerImgTypeEnum,
} from '@resources/owner/domain/owner.domain';

type AllOwnerInformation = Partial<Owner> & { OwnerImg?: Partial<OwnerImg>[] };

export class OwnerMapper {
  public static toDomain(
    entity: AllOwnerInformation,
    options?: { passwordForEmail?: boolean; passwordForRedeem?: boolean },
  ): OwnerDomain {
    if (!entity || Object.keys(entity).length < 1) return null;
    const ownerDomain = new OwnerDomain();
    ownerDomain.id = entity.id;
    ownerDomain.emailForSendNotification = entity.emailForSendingVoucher;
    ownerDomain.colorCode = entity.colorCode;
    ownerDomain.name = entity.name;
    if (options && options.passwordForEmail) {
      ownerDomain.passwordForEmail = entity.passwordForEmail;
    }
    if (options && options.passwordForRedeem) {
      ownerDomain.passwordForRedeem = entity.passwordForRedeem;
    }
    if (entity.OwnerImg && entity.OwnerImg.length > 1) {
      ownerDomain.img = entity.OwnerImg.map((item) => ({
        id: item.id,
        imgPath: item.imgPath,
        type: OwnerImgTypeEnum[item.type],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
    }
    return ownerDomain;
  }
}

export class OwnerImgMapper {
  public static toDomain(entity: OwnerImg): OwnerImgDomain {
    if (!entity || Object.keys(entity).length < 1) return null;
    const ownerImgDomain = new OwnerImgDomain();
    ownerImgDomain.id = entity.id;
    ownerImgDomain.imgPath = entity.imgPath;
    ownerImgDomain.type = OwnerImgTypeEnum[entity.type];
    ownerImgDomain.createdAt = entity.createdAt;
    ownerImgDomain.updatedAt = entity.updatedAt;
    return ownerImgDomain;
  }
}
