import { Category, Prisma, VoucherTag } from '@prisma/client';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { ObjectHelper } from '@utils/services/object.helper';

type VoucherTagAllInfo = VoucherTag & {
  category: Category;
};

export class VoucherTagMapper {
  public static toDomain(
    voucherTagEntity: VoucherTagAllInfo,
  ): VoucherTagDomain {
    if (!ObjectHelper.isObjectEmpty(voucherTagEntity)) return null;
    const { category, ...voucherTag } = voucherTagEntity;
    let categoryName = '';
    if (!ObjectHelper.isObjectEmpty) categoryName = category.name;

    return new VoucherTagDomain({ ...voucherTag, category: categoryName }); // VoucherTagDomain
  }
}
