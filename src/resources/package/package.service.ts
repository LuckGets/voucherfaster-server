import { Injectable, Logger } from '@nestjs/common';
import { PackageVoucherRepository } from 'src/infrastructure/persistence/package/package.repository';
import { CreatePackageVoucherDto } from './dto/create-package.dto';
import {
  PackageImgCreateInput,
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

@Injectable()
export class PackageVoucherService {
  constructor(
    private logger: Logger,
    private packageVoucherRepository: PackageVoucherRepository,
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
    const { rewardVoucherId, ...restData } = data;

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

    return this.packageVoucherRepository.createPackageVoucher({
      packageVoucherCreateInput: packageData,
      packageImage: packageImgCreateData,
      packageRewardVoucher: rewardVoucherData,
    });
  }

  async getAllPackageVoucher(): Promise<PackageVoucherDomain[]> {
    return this.packageVoucherRepository.findManyPackageVoucher();
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
}
