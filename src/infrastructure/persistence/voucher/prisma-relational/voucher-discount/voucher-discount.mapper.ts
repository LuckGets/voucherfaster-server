// import {
//   Category,
//   Voucher,
//   VoucherDiscount,
//   VoucherImg,
//   VoucherTag,
// } from '@prisma/client';
// import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
// import { VoucherMapper } from '../voucher.mapper';

// export type VoucherDiscountAllInfo = VoucherDiscount & {
//   voucher: Voucher & {
//     voucherTag?: VoucherTag & {
//       category?: Pick<Category, 'name'>;
//     };
//     VoucherImg?: Pick<VoucherImg, 'id' | 'imgPath' | 'mainImg'>[];
//   };
// };

// export class VoucherDiscountMapper {
//   public static toVoucherDomain(
//     discountEntity: VoucherDiscountAllInfo,
//   ): VoucherDomain {
//     const { voucher, ...discount } = discountEntity;
//     return VoucherMapper.toDomain(
//       {
//         ...voucher,
//         VoucherDiscount: discount,
//         voucherTag: voucher.voucherTag,
//         VoucherImg: voucher.VoucherImg,
//       },
//       { allInfo: true },
//     );
//   }
// }
