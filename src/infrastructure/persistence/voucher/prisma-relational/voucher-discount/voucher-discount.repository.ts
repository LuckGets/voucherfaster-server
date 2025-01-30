// import { Inject } from '@nestjs/common';
// import { PrismaService } from '../../../config/prisma.service';
// import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
// import { CreateVoucherDiscountDto } from '@resources/voucher/dto/voucher-discount/create-discount.dto';
// import { DiscountStatus, Prisma } from '@prisma/client';
// import { VoucherDiscountMapper } from './voucher-discount.mapper';
// import { VoucherDiscountDomain } from '@resources/voucher/domain/voucher-discount.domain';
// import { UpdateVoucherDiscountDto } from '@resources/voucher/dto/voucher-discount/update-discount.dto';
// import { VoucherMapper } from '../voucher.mapper';

// export class VoucherDiscountRelationalPrismaORMRepository
//   implements  VoucherDisc
// {
//   constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

//   private includeVoucherQuery: Prisma.VoucherDiscountInclude = {
//     voucher: {
//       include: {
//         voucherTag: {
//           include: {
//             category: true,
//           },
//         },
//         VoucherImg: {
//           select: {
//             id: true,
//             imgPath: true,
//             mainImg: true,
//           },
//         },
//       },
//     },
//   };

//   async create(payload: CreateVoucherDiscountDto): Promise<VoucherDomain> {
//     const data: Prisma.VoucherDiscountCreateInput = {
//       discountedPrice: payload.discountedPrice,
//       status: DiscountStatus.ACTIVE,
//       voucher: {
//         connect: {
//           id: payload.voucherId,
//         },
//       },
//     };
//     const createdVoucherDiscount =
//       await this.prismaService.voucherDiscount.create({
//         data,
//         include: this.includeVoucherQuery,
//       });
//     return VoucherDiscountMapper.toVoucherDomain(createdVoucherDiscount);
//   }

//   // async update(payload: UpdateVoucherDiscountDto): Promise<VoucherDomain> {
//   //   const { voucherId, discountedPrice, status } = payload;
//   //   const data: Prisma.VoucherDiscountUpdateInput = {};

//   //   if (discountedPrice) data.discountedPrice = discountedPrice;

//   //   if (status)
//   //     status.toUpperCase() === DiscountStatus.INACTIVE
//   //       ? (data.status = DiscountStatus.INACTIVE)
//   //       : (data.status = DiscountStatus.ACTIVE);

//   //   const updatedVoucherDiscount = await this.prismaService.voucher.update({
//   //     where: { id: voucherId },
//   //     data: {
//   //       VoucherDiscount: {
//   //         update: { data },
//   //       },
//   //     },
//   //     include: this.includeVoucherQuery,
//   //   });

//   //   return VoucherMapper.toDomain(updatedVoucherDiscount, { allInfo: true });
//   // }

//   async delete(id: VoucherDiscountDomain['id']): Promise<void> {
//     await this.prismaService.voucherDiscount.update({
//       where: {
//         id,
//       },
//       data: {
//         status: DiscountStatus.INACTIVE,
//       },
//     });
//     return;
//   }
// }
