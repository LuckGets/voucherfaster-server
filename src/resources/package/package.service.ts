import { Injectable, Logger } from '@nestjs/common';
import { PackageVoucherRepository } from 'src/infrastructure/persistence/package/package.repository';
import { CreatePackageVoucherDto } from './dto/create-package.dto';
import {
  PackageImgCreateInput,
  PackageImgDomain,
  PackageRewardVoucherCreateInput,
  PackageVoucherCreateInput,
  PackageVoucherDomain,
} from './domain/package-voucher.domain';
import { MediaService } from '@application/media/media.service';
import { UUIDService } from '@utils/services/uuid.service';
import { VoucherService } from '@resources/voucher/voucher.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { isUUID } from 'class-validator';
import { NullAble } from '@utils/types/common.type';
import {
  packageVoucherTermAndCondENCreateInput,
  packageVoucherTermAndCondTHCreateInput,
} from './domain/package-voucher-term-cond.domain';
import { UpdatePackageVoucherDto } from './dto/update-package.dto';
import { PackageImgRepository } from 'src/infrastructure/persistence/package/package-img.repository';

@Injectable()
export class PackageVoucherService {
  constructor(
    private logger: Logger,
    private packageVoucherRepository: PackageVoucherRepository,
    private packageImgRepository: PackageImgRepository,
    private voucherService: VoucherService,
    private uuidService: UUIDService,
    private mediaService: MediaService,
  ) {}

  async createPackageVoucher({
    data,
    mainImg,
    packageImg,
  }: {
    data: CreatePackageVoucherDto;
    mainImg: Express.Multer.File;
    packageImg?: Express.Multer.File[];
  }): Promise<PackageVoucherDomain> {
    const idList = [
      data.quotaVoucherId,
      ...data.rewardVoucherId.filter((item) => item !== data.quotaVoucherId),
    ];
    // Check first if the voucher ID provided as
    // quota and reward is existing.
    const isAllVouchersExist =
      await this.voucherService.getVoucherByIds(idList);

    // If not, then throw the error.
    if (isAllVouchersExist.length !== idList.length) {
      // Extract found IDs
      const foundIds = isAllVouchersExist.map((voucher) => voucher.id);

      // Determine which IDs were not found
      const notFoundIds = idList.filter((id) => !foundIds.includes(id));

      const errMessage = `Voucher ID ${notFoundIds.join(', ')} could not be found.`;
      this.logger.warn(errMessage);
      throw ErrorApiResponse.notFoundRequest(errMessage);
    }

    // Upload the image and retrieve the image url path
    // to store in database.
    const allImgBuffer = [];

    if (mainImg) allImgBuffer.push(mainImg);
    if (packageImg && packageImg.length > 0) allImgBuffer.push(...packageImg);

    if (allImgBuffer.length < 1) throw ErrorApiResponse.conflictRequest();
    const allPackageImgLinks = await Promise.all(
      allImgBuffer.map((item) =>
        this.mediaService.uploadFile(item, s3BucketDirectory.packageImg),
      ),
    );

    // ------- SECOND PART : PREPARE INFORMATION -------

    // Extract reward voucher ID from package voucher data
    const { rewardVoucherId, termAndCondTh, termAndCondEn, ...restData } = data;

    const packageData: PackageVoucherCreateInput = {
      id: String(this.uuidService.make()),
      ...restData,
    };

    const rewardVoucherData: PackageRewardVoucherCreateInput[] =
      rewardVoucherId.map((item) => {
        return {
          id: String(this.uuidService.make()),
          rewardVoucherId: item,
          packageId: packageData.id,
        };
      });

    const packageImgCreateData: PackageImgCreateInput[] =
      allPackageImgLinks.map((item, index) => {
        return {
          id: String(this.uuidService.make()),
          packageId: packageData.id,
          imgPath: item,
          mainImg: index === 0,
        };
      });

    const packageTermAndCondTHData: packageVoucherTermAndCondTHCreateInput[] =
      termAndCondTh.map((item) => {
        return {
          id: String(this.uuidService.make()),
          description: item,
          packageVoucherId: packageData.id,
        };
      });

    const packageTermAndCondENData: packageVoucherTermAndCondENCreateInput[] =
      termAndCondTh.map((item) => {
        return {
          id: String(this.uuidService.make()),
          description: item,
          packageVoucherId: packageData.id,
        };
      });

    return this.packageVoucherRepository.createPackageVoucher({
      packageVoucherCreateInput: packageData,
      packageImage: packageImgCreateData,
      packageRewardVoucher: rewardVoucherData,
      packageVoucherTermAndCondTH: packageTermAndCondTHData,
      packageVoucherTermAndCondEN: packageTermAndCondENData,
    });
  }

  async getAllPackageVoucher(): Promise<PackageVoucherDomain[]> {
    return this.packageVoucherRepository.findManyPackageVoucher();
  }

  async getPackageVoucherById(
    packageId: PackageVoucherDomain['id'],
  ): Promise<NullAble<PackageVoucherDomain>> {
    if (!packageId || !isUUID(packageId))
      throw ErrorApiResponse.badRequest(
        `${packageId} is not valid data type for searching.`,
      );
    return this.packageVoucherRepository.findPackageVoucherById(packageId);
  }

  async updatePackageVoucher(
    data: UpdatePackageVoucherDto,
  ): Promise<PackageVoucherDomain> {
    if (data && Object.keys(data).length === 1)
      throw ErrorApiResponse.badRequest(
        'Please provide information required for this request.',
      );

    const isPackageExist =
      await this.packageVoucherRepository.findPackageVoucherById(data.id);
    if (!isPackageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${data.id} could not be found.`,
      );

    return this.packageVoucherRepository.updatePackageVoucher(data);
  }

  async deletePackageVoucherById(
    packageId: PackageVoucherDomain['id'],
  ): Promise<void> {
    if (!packageId || !isUUID(packageId, 7))
      throw ErrorApiResponse.conflictRequest(
        `${packageId} is not the valid type of data for this request.`,
      );

    return this.packageVoucherRepository.deletePackageVoucherById(packageId);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- PACKAGE IMAGE PART ----------------------- //
  // -------------------------------------------------------------------- //

  async createPackageImg(
    id: PackageVoucherDomain['id'],
    files: Express.Multer.File[],
  ): Promise<PackageImgDomain[]> {
    const isPackageExist =
      await this.packageVoucherRepository.findPackageVoucherById(id);
    if (!isPackageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${id} could not be found.`,
      );

    const uploadedImgPath = await Promise.all(
      files.map((item) =>
        this.mediaService.uploadFile(item, s3BucketDirectory.packageImg),
      ),
    );

    const createPackageImgData: PackageImgCreateInput[] = uploadedImgPath.map(
      (item) => ({
        id: String(this.uuidService.make()),
        imgPath: item,
        mainImg: false,
        packageId: id,
      }),
    );

    return this.packageImgRepository.createMany(createPackageImgData);
  }

  async updatePackageImg(
    id: PackageImgDomain['id'],
    file: Express.Multer.File,
  ) {
    const isPackageImgExist = await this.packageImgRepository.findById(id);
    if (!isPackageImgExist)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${id} could not be found.`,
      );
    const uploadedImgPath = await this.mediaService.uploadFile(
      file,
      s3BucketDirectory.packageImg,
    );
    return this.packageImgRepository.update(id, uploadedImgPath);
  }

  async deletePackageImg(id: PackageImgDomain['id']): Promise<void> {
    if (!id || !isUUID(id))
      throw ErrorApiResponse.badRequest(
        `${id} is not valid data type for this request.`,
      );
    const isPackageImgExist = await this.packageImgRepository.findById(id);
    if (!isPackageImgExist)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${id} could not be found.`,
      );

    await this.mediaService.deleteFile(isPackageImgExist.imgPath);
    return this.packageImgRepository.deleteById(id);
  }
}
