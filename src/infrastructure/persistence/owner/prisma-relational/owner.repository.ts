import { Inject } from '@nestjs/common';
import { CreateOwnerImgDataType, OwnerRepository } from '../owner.repository';
import { PrismaService } from '../../config/prisma.service';
import {
  OwnerDomain,
  OwnerImgDomain,
} from '@resources/owner/domain/owner.domain';
import { Prisma } from '@prisma/client';
import { OwnerImgMapper, OwnerMapper } from './owner.mapper';
import { NullAble } from '@utils/types/common.type';
import { ErrorApiResponse } from 'src/common/core-api-response';

export class OwnerRelationalPrismaORMRepository implements OwnerRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  private joinQuery: Prisma.OwnerFindFirstArgs = {
    include: {
      OwnerImg: true,
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
    Pick<OwnerDomain, 'emailForSendNotification' | 'passwordForEmail'>
  > {
    const emailInfo = await this.prismaService.owner.findFirst();
    return OwnerMapper.toDomain(emailInfo, { passwordForEmail: true });
  }

  /**
   * @param imageId id of the image that you want to find
   * @returns `OwnerImgDomain` if found or `null` if not found
   *
   * Find owner image by id.
   * If not found, return `null`.
   */
  async findImageById(
    imageId: OwnerImgDomain['id'],
  ): Promise<NullAble<OwnerImgDomain>> {
    const ownerImg = await this.prismaService.ownerImg.findUnique({
      where: { id: imageId },
    });
    return OwnerImgMapper.toDomain(ownerImg);
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

  // -------------------------------------------------------------------- //
  // ------------------------- OWNER IMAGE PART ------------------------- //
  // -------------------------------------------------------------------- //

  async createManyOwnerImg(payload: CreateOwnerImgDataType[]): Promise<number> {
    try {
      /******  b896bd5d-4a03-4e90-8b0a-e26ce9676100  *******/
      return this.prismaService.$transaction(async (tx) => {
        const { count } = await tx.ownerImg.createMany({
          data: payload,
        });
        return count;
      });
    } catch (err) {
      console.error(err);
      throw ErrorApiResponse.internalServerError(err);
    }
  }

  async updateOwnerImgById(
    id: OwnerImgDomain['id'],
    newImgPath: OwnerImgDomain['imgPath'],
  ): Promise<OwnerImgDomain> {
    const updatedImg = await this.prismaService.ownerImg.update({
      data: { imgPath: newImgPath },
      where: { id },
    });
    return OwnerImgMapper.toDomain(updatedImg);
  }

  async deleteOwnerImgById(id: OwnerImgDomain['id']): Promise<void> {
    await this.prismaService.ownerImg.delete({
      where: { id },
    });
    return;
  }
}
