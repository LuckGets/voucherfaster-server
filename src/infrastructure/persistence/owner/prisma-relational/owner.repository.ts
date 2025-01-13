import { Inject } from '@nestjs/common';
import { OwnerRepository } from '../owner.repository';
import { PrismaService } from '../../config/prisma.service';
import {
  OwnerDomain,
  OwnerImgDomain,
} from '@resources/owner/domain/owner.domain';
import { Prisma } from '@prisma/client';
import { OwnerMapper } from './owner.mapper';
import { NullAble } from '@utils/types/common.type';

export class OwnerRelationalPrismaORMRepository implements OwnerRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private joinQuery: Prisma.OwnerFindFirstArgs = {
    include: {
      OwnerImg: {
        where: {
          deletedAt: {
            equals: null,
          },
        },
      },
    },
  };

  async findOwnerInformation(): Promise<OwnerDomain> {
    const joinQuery = this.joinQuery;
    const ownerInfo = await this.prismaService.owner.findFirst({
      ...joinQuery,
    });
    return OwnerMapper.toDomain(ownerInfo);
  }

  async findEmailInformation(): Promise<
    Pick<OwnerDomain, 'email' | 'passwordForEmail'>
  > {
    const emailInfo = await this.prismaService.owner.findFirst();
    return OwnerMapper.toDomain(emailInfo);
  }

  async findImageById(
    imageId: OwnerImgDomain['id'],
  ): Promise<NullAble<OwnerImgDomain>> {
    return this.prismaService.ownerImg.findUnique({ where: { id: imageId } });
  }

  async updateOwnerInformation(
    data: Partial<OwnerDomain>,
  ): Promise<OwnerDomain> {
    const owner = await this.prismaService.owner.findFirst();
    const updatedInfo = await this.prismaService.owner.update({
      data,
      where: { id: owner.id },
    });
    return OwnerMapper.toDomain(updatedInfo);
  }

  async updateOwnerImgById(
    id: OwnerImgDomain['id'],
    newImgPath: OwnerImgDomain['imgPath'],
  ): Promise<OwnerImgDomain> {
    const updatedImg = await this.prismaService.ownerImg.update({
      data: { imgPath: newImgPath },
      where: { id },
    });
    return updatedImg;
  }

  async deleteOwnerImgById(id: OwnerImgDomain['id']): Promise<void> {
    const currentTime = new Date(Date.now());
    await this.prismaService.ownerImg.update({
      data: { deletedAt: currentTime },
      where: { id },
    });
    return;
  }
}
