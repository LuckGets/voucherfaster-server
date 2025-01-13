import { Owner, OwnerImg } from '@prisma/client';
import {
  OwnerDomain,
  OwnerImgTypeEnum,
} from '@resources/owner/domain/owner.domain';

type AllOwnerInformation = Owner & { OwnerImg?: Partial<OwnerImg>[] };

export class OwnerMapper {
  public static toDomain(entity: AllOwnerInformation): OwnerDomain {
    if (!entity || Object.keys(entity).length < 1) return null;
    const ownerDomain = new OwnerDomain();
    ownerDomain.email = entity.emailForSendingVoucher;
    ownerDomain.colorCode = entity.colorCode;
    if (entity.OwnerImg && entity.OwnerImg.length < 1) {
      ownerDomain.img = entity.OwnerImg.map((item) => ({
        id: item.id,
        imgPath: item.imgPath,
        type: OwnerImgTypeEnum[item.imgType],
      }));
    }
    return ownerDomain;
  }
}
