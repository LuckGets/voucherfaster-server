import {
  PackageImgCreateInput,
  PackageImgDomain,
} from '@resources/package/domain/package-voucher.domain';
import { PackageImgRepository } from '../package-img.repository';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { NullAble } from '@utils/types/common.type';

export class PackageImgRelationalPrismaORMRepository
  implements PackageImgRepository
{
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  async createMany(
    imgData: PackageImgCreateInput[],
  ): Promise<PackageImgDomain[]> {
    return this.prismaService.$transaction((tx) => {
      return Promise.all(
        imgData.map((item) => tx.packageImg.create({ data: item })),
      );
    });
  }

  findById(id: PackageImgDomain['id']): Promise<NullAble<PackageImgDomain>> {
    return this.prismaService.packageImg.findUnique({ where: { id } });
  }

  update(
    id: PackageImgDomain['id'],
    payload: PackageImgDomain['imgPath'],
  ): Promise<PackageImgDomain> {
    return this.prismaService.packageImg.update({
      where: { id },
      data: { imgPath: payload },
    });
  }

  async deleteById(id: PackageImgDomain['id']): Promise<void> {
    await this.prismaService.packageImg.delete({ where: { id } });
    return;
  }
}
