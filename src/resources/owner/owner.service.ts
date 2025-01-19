import { Injectable } from '@nestjs/common';
import {
  CreateOwnerImgDataType,
  OwnerRepository,
} from 'src/infrastructure/persistence/owner/owner.repository';
import {
  OwnerDomain,
  OwnerImgDomain,
  OwnerImgTypeEnum,
} from './domain/owner.domain';
import { UpdateOwnerInformationDto } from './dto/update-owner.dto';
import { CryptoService } from '@utils/services/crypto.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { UUIDService } from '@utils/services/uuid.service';

@Injectable()
export class OwnerService {
  private encryptKey: string;
  constructor(
    private ownerRepository: OwnerRepository,
    private configService: ConfigService<AllConfigType>,
    private uuidService: UUIDService,
    private mediaService: MediaService,
  ) {
    this.encryptKey = this.configService.getOrThrow('mail.encryptKey', {
      infer: true,
    });
  }

  getOwnerInformation(): Promise<OwnerDomain> {
    return this.ownerRepository.findOwnerInformation();
  }

  async getEmailInformation(): Promise<
    Pick<OwnerDomain, 'emailForSendNotification' | 'passwordForEmail'>
  > {
    const ownerEmailInfo = await this.ownerRepository.findEmailInformation();
    if (!ownerEmailInfo.passwordForEmail) {
      throw ErrorApiResponse.internalServerError(
        `Could not sending email as there is no any provided password.`,
      );
    }
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

  async addOwnerImg(files: Express.Multer.File[]): Promise<number> {
    const owner = await this.ownerRepository.findOwnerInformation();
    if (!owner || !owner.id) {
      throw ErrorApiResponse.conflictRequest(
        `Owner ID could not found. Please add owner information first.`,
      );
    }
    const uploadedImgPaths = await Promise.all(
      files.map((file) =>
        this.mediaService.uploadFile(
          file.buffer,
          file.filename,
          file.mimetype,
          s3BucketDirectory.ownerImg,
        ),
      ),
    );
    const createOwnerImgData: CreateOwnerImgDataType[] = uploadedImgPaths.map(
      (item) => ({
        id: String(this.uuidService.make()),
        imgPath: item,
        ownerId: owner.id,
        type: OwnerImgTypeEnum.BACKGROUND,
      }),
    );
    return this.ownerRepository.createManyOwnerImg(createOwnerImgData);
  }

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

  async deleteOwnerImageById(imageId: OwnerImgDomain['id']): Promise<void> {
    const isImageExist = await this.ownerRepository.findImageById(imageId);

    if (!isImageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Owner image ID: ${imageId} could not be found.`,
      );

    await this.mediaService.deleteFile(isImageExist.imgPath);
    return this.ownerRepository.deleteOwnerImgById(imageId);
  }
}
