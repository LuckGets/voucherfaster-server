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
import {
  UpdateOwnerInformationDto,
  UpdateOwnerPasswordForRedeem,
} from './dto/update-owner.dto';
import { CryptoService } from '@utils/services/crypto.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { UUIDService } from '@utils/services/uuid.service';

@Injectable()
export class OwnerService {
  private emailEncryptKey: string;
  private redeemPasswordEncryptKey: string;
  private hashSaltRound: number;
  constructor(
    private ownerRepository: OwnerRepository,
    private configService: ConfigService<AllConfigType>,
    private cryptoService: CryptoService,
    private uuidService: UUIDService,
    private mediaService: MediaService,
  ) {
    this.emailEncryptKey = this.configService.getOrThrow('mail.encryptKey', {
      infer: true,
    });

    this.redeemPasswordEncryptKey = this.configService.getOrThrow(
      'owner.passwordForRedeemSecret',
      { infer: true },
    );

    this.hashSaltRound = this.configService.getOrThrow('auth.bcryptSaltRound', {
      infer: true,
    });
  }

  public getOwnerInformation(): Promise<OwnerDomain> {
    return this.ownerRepository.findOwnerInformation();
  }

  public async getEmailInformation(): Promise<
    Pick<OwnerDomain, 'emailForSendNotification' | 'passwordForEmail'>
  > {
    const ownerEmailInfo = await this.ownerRepository.findEmailInformation();
    if (!ownerEmailInfo.passwordForEmail) {
      throw ErrorApiResponse.internalServerError(
        `Could not sending email as there is no any provided password.`,
      );
    }
    const password = await this.cryptoService.decrypt(
      ownerEmailInfo.passwordForEmail,
      this.emailEncryptKey,
    );
    return { ...ownerEmailInfo, passwordForEmail: password };
  }

  public async getPasswordForRedeem(): Promise<
    OwnerDomain['passwordForRedeem']
  > {
    const passwordForRedeem =
      await this.ownerRepository.findOwnerPasswordForRedeem();

    return this.cryptoService.decrypt(
      passwordForRedeem,
      this.redeemPasswordEncryptKey,
    );
  }

  public updateInformation(
    data: UpdateOwnerInformationDto,
  ): Promise<OwnerDomain> {
    return this.ownerRepository.updateOwnerInformation(data);
  }

  public async checkPasswordForRedeem(
    password: OwnerDomain['passwordForRedeem'],
  ): Promise<boolean> {
    const ownerPassword =
      await this.ownerRepository.findOwnerPasswordForRedeem();
    return this.cryptoService.compare(password, ownerPassword);
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
        this.mediaService.uploadFile({
          file: file.buffer,
          fileName: file.filename,
          filePath: file.path,
          mimeType: file.mimetype,
          bucketDir: s3BucketDirectory.ownerImg,
        }),
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

  public async updateOwnerImage(
    image: Express.Multer.File,
    imageId: OwnerImgDomain['id'],
  ): Promise<OwnerImgDomain> {
    const isImageExist = await this.ownerRepository.findImageById(imageId);

    if (!isImageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Owner image ID: ${imageId} could not be found.`,
      );
    await this.mediaService.deleteFile(isImageExist.imgPath);
    const uploadedImgPath = await this.mediaService.uploadFile({
      file: image.buffer,
      fileName: image.filename,
      filePath: image.path,
      mimeType: image.mimetype,
      bucketDir: s3BucketDirectory.ownerImg,
    });
    return this.ownerRepository.updateOwnerImgById(imageId, uploadedImgPath);
  }

  public async updateOwnerPasswordForRedeem(
    body: UpdateOwnerPasswordForRedeem,
  ) {
    const { oldPassword, newPassword } = body;
    const isPasswordCorrect = await this.checkPasswordForRedeem(oldPassword);
    if (!isPasswordCorrect)
      throw ErrorApiResponse.unauthorizedRequest(
        'Old password is not correct.',
      );

    const hashedNewPassword = this.cryptoService.encrypt(
      newPassword,
      this.redeemPasswordEncryptKey,
    );
    return this.ownerRepository.updateOwnerPasswordForRedeem(hashedNewPassword);
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
