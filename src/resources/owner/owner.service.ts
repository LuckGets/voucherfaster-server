import { Injectable } from '@nestjs/common';
import { OwnerRepository } from 'src/infrastructure/persistence/owner/owner.repository';
import { OwnerDomain, OwnerImgDomain } from './domain/owner.domain';
import { UpdateOwnerInformationDto } from './dto/update-owner.dto';
import { CryptoService } from '@utils/services/crypto.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { ErrorApiResponse } from 'src/common/core-api-response';

@Injectable()
export class OwnerService {
  private encryptKey: string;
  constructor(
    private ownerRepository: OwnerRepository,
    private configService: ConfigService<AllConfigType>,
    private mediaService: MediaService,
  ) {
    this.encryptKey = this.configService.getOrThrow('mail.encryptKey', {
      infer: true,
    });
  }

  getAllInformation(): Promise<OwnerDomain> {
    return this.ownerRepository.findOwnerInformation();
  }

  async getEmailInformation(): Promise<
    Pick<OwnerDomain, 'email' | 'passwordForEmail'>
  > {
    const ownerEmailInfo = await this.ownerRepository.findEmailInformation();
    const password = await CryptoService.decrypt(
      ownerEmailInfo.passwordForEmail,
      this.encryptKey,
    );
    return { ...ownerEmailInfo, passwordForEmail: password };
  }

  updateInformation(data: UpdateOwnerInformationDto): Promise<OwnerDomain> {
    return this.ownerRepository.updateOwnerInformation(data);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- OWNER IMAGE PART ------------------------- //
  // -------------------------------------------------------------------- //

  async updateOwnerImage(
    image: Express.Multer.File,
    imageId: OwnerImgDomain['id'],
  ): Promise<OwnerImgDomain> {
    const isImageExist = await this.ownerRepository.findImageById(imageId);

    if (!isImageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Owner image ID: ${imageId} could not be found.`,
      );
    const uploadedImgPath = await this.mediaService.uploadFile(
      image.buffer,
      image.filename,
      image.mimetype,
      s3BucketDirectory.ownerImg,
    );
    return this.ownerRepository.updateOwnerImgById(imageId, uploadedImgPath);
  }

  async deleteOwnerImage(imageId: OwnerImgDomain['id']): Promise<void> {
    const isImageExist = await this.ownerRepository.findImageById(imageId);

    if (!isImageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Owner image ID: ${imageId} could not be found.`,
      );
    return this.ownerRepository.deleteOwnerImgById(imageId);
  }
}
