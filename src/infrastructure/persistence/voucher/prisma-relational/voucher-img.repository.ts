import {
  VoucherDomain,
  VoucherImgCreateInput,
  VoucherImgDomain,
  VoucherImgUpdateInput,
} from '@resources/voucher/domain/voucher.domain';
import { NullAble } from '@utils/types/common.type';
import { PrismaService } from '../../config/prisma.service';
import { Inject } from '@nestjs/common';
import { VoucherImgRepository } from '../voucher.repository';

export class VoucherImgRelationalPrismaORMRepository
  implements VoucherImgRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  findById(id: VoucherImgDomain['id']): Promise<NullAble<VoucherImgDomain>> {
    return this.prismaService.voucherImg.findUnique({
      where: {
        id,
      },
    });
  }
  findManyByVoucherId(
    voucherId: VoucherDomain['id'],
  ): Promise<NullAble<VoucherImgDomain[]>> {
    return;
  }
  updateNewMainImgVoucher({
    mainImgId,
    data,
    deleteMainImg,
  }: {
    mainImgId: VoucherImgDomain['id'];
    data: VoucherImgCreateInput;
    deleteMainImg: boolean;
  }): Promise<VoucherImgDomain> {
    return this.prismaService.$transaction(async (txUnit) => {
      // Update the main image to non-main image
      const mainImgAction = deleteMainImg
        ? txUnit.voucherImg.delete({
            where: {
              id: mainImgId,
            },
          })
        : txUnit.voucherImg.update({
            where: {
              id: mainImgId,
            },
            data: {
              mainImg: false,
            },
          });

      const [, newVoucherImg] = await Promise.all([
        mainImgAction,
        txUnit.voucherImg.create({
          data,
        }),
      ]);
      return newVoucherImg;
    });
  }
  updateVoucherImg(
    id: VoucherImgDomain['id'],
    payload: VoucherImgUpdateInput,
  ): Promise<NullAble<VoucherImgDomain>> {
    return;
  }
  async createMany(dataList: VoucherImgCreateInput[]): Promise<void> {
    await this.prismaService.voucherImg.createMany({ data: dataList });
    return;
  }
}
