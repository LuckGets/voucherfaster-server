import { Injectable, Logger } from '@nestjs/common';
import { PackageVoucherRepository } from 'src/infrastructure/persistence/package/package.repository';
import {
  CreatePackageVoucherDto,
  PACKAGE_FILE_FIELD,
} from './dto/create-package.dto';
import {
  PackageImgCreateInput,
  PackageImgDomain,
  PackageRewardVoucherCreateInput,
  PackageRewardVoucherDomain,
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
import {
  UpdatePackageRewardVoucherDto,
  UpdatePackageVoucherDto,
} from './dto/update-package.dto';
import { PackageImgRepository } from 'src/infrastructure/persistence/package/package-img.repository';
import { ProductDomainHelper } from 'src/common/product.helper';
import {
  VoucherCategoryDomain,
  VoucherDomain,
} from '@resources/voucher/domain/voucher.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import { CalculatorService } from '@utils/services/calculator.service';
import {
  PackageSellDateQueryEnum,
  PackageStatusQueryEnum,
} from './dto/get-package.dto';
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';

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
    mainImg: Express.Multer.File[];
    packageImg?: Express.Multer.File[];
  }): Promise<PackageVoucherDomain> {
    if (!mainImg || mainImg.length === 0)
      throw ErrorApiResponse.badRequest('Main image for voucher is required.');
    // Extract reward voucher ID from package voucher data
    const { rewardVouchers, termAndCondTh, termAndCondEn, ...restData } = data;

    if (termAndCondTh.length === 0 && termAndCondEn.length === 0)
      throw ErrorApiResponse.badRequest(
        `Please provide value for term and condition field.`,
      );

    const rewardVoucherIdSet = new Set<VoucherDomain['id']>();
    const rewardVoucherData: PackageRewardVoucherCreateInput[] = [];
    // Extract reward voucher ID from package voucher data
    const packageId = String(this.uuidService.make());
    const idList = [data.quotaVoucherId];
    for (const item of data.rewardVouchers) {
      if (rewardVoucherIdSet.has(item.voucherId))
        throw ErrorApiResponse.badRequest(
          `Reward voucher ID: ${item.voucherId} was duplicated. If desired to add more amount of the same voucher, please add the number in the amount of the desired voucher ID field.`,
        );
      rewardVoucherIdSet.add(item.voucherId);
      rewardVoucherData.push({
        id: String(this.uuidService.make()),
        amount: item.amount,
        packageId,
        rewardVoucherId: item.voucherId,
      });
      if (item.voucherId !== data.quotaVoucherId) idList.push(item.voucherId);
    }

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
    const allImgBuffer: Express.Multer.File[] = [];

    allImgBuffer.push(mainImg[0]);
    if (packageImg && packageImg.length > 0) allImgBuffer.push(...packageImg);

    if (allImgBuffer.length < 1) throw ErrorApiResponse.conflictRequest();
    const allPackageImgLinks = await Promise.all(
      allImgBuffer.map((item) =>
        this.mediaService.uploadFile({
          file: item.buffer,
          fileName: item.filename,
          filePath: item.path,
          mimeType: item.mimetype,
          bucketDir: s3BucketDirectory.packageImg,
        }),
      ),
    );

    // ------- SECOND PART : PREPARE INFORMATION -------

    // Extract reward voucher ID from package voucher data
    // Extract reward voucher ID from package voucher data
    const packageData: PackageVoucherCreateInput = {
      id: packageId,
      ...restData,
    };

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

  async getAllPackageVoucher({
    category,
    cursor,
    status,
    sellDate,
  }: {
    cursor?: PackageVoucherDomain['id'];
    category?: VoucherCategoryDomain['name'];
    status?: PackageStatusQueryEnum;
    sellDate?: PackageSellDateQueryEnum;
  }): Promise<PackageVoucherDomain[]> {
    const statusToQuery = this.checkStatusQuery(status);
    const sellDateQuery = this.checkSellDateQuery(sellDate);

    if (cursor && !isUUID(cursor))
      throw ErrorApiResponse.badRequest(
        `Cursor: ${cursor} is not valid data type for searching.`,
      );

    if (status) {
    }
    return this.packageVoucherRepository.findManyPackageVoucher({
      cursor,
      category,
      status: statusToQuery,
      sellDate: sellDateQuery,
    });
  }

  private checkStatusQuery(status: PackageStatusQueryEnum) {
    return EnumCheckerHelper.getEnumValueOrThrow(
      PackageStatusQueryEnum,
      status,
      PackageStatusQueryEnum.ACTIVE,
    );
  }

  private checkSellDateQuery(
    sellDate: PackageSellDateQueryEnum,
  ): PackageSellDateQueryEnum {
    return EnumCheckerHelper.getEnumValueOrThrow(
      PackageSellDateQueryEnum,
      sellDate,
      PackageSellDateQueryEnum.NOW,
    );
  }

  async getPackageVoucherById(
    packageId: PackageVoucherDomain['id'],
  ): Promise<NullAble<PackageVoucherDomain>> {
    if (!packageId || !isUUID(packageId))
      throw ErrorApiResponse.badRequest(
        `${packageId} is not valid data type for searching.`,
      );
    const packageVoucher =
      await this.packageVoucherRepository.findPackageVoucherById(packageId);
    if (!packageVoucher)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${packageId} could not be found.`,
      );
    return packageVoucher;
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

    // Check the update date data if provided
    ProductDomainHelper.checkUsableAndSellTime(data, isPackageExist, 'package');

    // Check the other update data if provided
    ProductDomainHelper.checkUpdateData(data, isPackageExist, 'package');
    if (!ObjectHelper.isObjectEmpty(data.rewardVouchers)) {
      await this.checkRewardVoucherBeforeUpdate(
        data.rewardVouchers,
        isPackageExist.rewardVouchers,
      );
    }

    return this.packageVoucherRepository.updatePackageVoucher(data);
  }

  private async checkRewardVoucherBeforeUpdate(
    data: UpdatePackageRewardVoucherDto,
    existRewardVouchers: PackageVoucherDomain['rewardVouchers'],
  ) {
    const { addRewardVouchers, removedRewardIds, update } = data;

    const rewardVoucherIdMap = new Map<
      PackageRewardVoucherDomain['id'],
      number
    >();
    existRewardVouchers.forEach((item) => {
      rewardVoucherIdMap.set(item.id, item.amount);
    });

    if (addRewardVouchers && addRewardVouchers.length === 0)
      throw ErrorApiResponse.badRequest(
        `Field addRewardVouchers does not have any provide value.`,
      );

    if (update && update.length === 0)
      throw ErrorApiResponse.badRequest(
        `Field update does not have any provide value.`,
      );

    if (removedRewardIds && removedRewardIds.length === 0)
      throw ErrorApiResponse.badRequest(
        `Field removedVoucherIds does not have any provide value.`,
      );

    // ADDING NEW REWARD VOUCER PATH
    if (addRewardVouchers && addRewardVouchers.length > 0) {
      const voucherMap = new Map<VoucherDomain['id'], boolean>();
      const allRewardVoucherIdList = [];
      addRewardVouchers.forEach((item) => {
        if (voucherMap.has(item.voucherId))
          throw ErrorApiResponse.badRequest(
            `Reward voucher ID: ${item.voucherId} in adding request is duplicated.`,
          );

        if (rewardVoucherIdMap.has(item.voucherId))
          throw ErrorApiResponse.badRequest(
            `Reward voucher ID: ${item.voucherId} is already part of the package. Please check if the reward voucher ID is correct or if request desire to update, please update instead.`,
          );

        voucherMap.set(item.voucherId, true);
        allRewardVoucherIdList.push(item.voucherId);
      });
      const isAllVoucherExist = await this.voucherService.getVoucherByIds(
        allRewardVoucherIdList,
      );

      if (isAllVoucherExist.length !== allRewardVoucherIdList.length) {
        const notFoundId = isAllVoucherExist.filter((itemId) =>
          allRewardVoucherIdList.filter((ele) => ele.id !== itemId),
        );
        throw ErrorApiResponse.conflictRequest(
          `Some reward voucher ID: ${notFoundId.join(', ')} could not be found.`,
        );
      }
    }

    if (update && update.length > 0) {
      const updateIdMap = new Map<VoucherDomain['id'], boolean>();
      update.forEach((item) => {
        const existAmount = rewardVoucherIdMap.get(item.rewardId);
        if (!existAmount)
          throw ErrorApiResponse.conflictRequest(
            `Reward voucher ID: ${item.rewardId} is not part of the package. Please check if the reward voucher ID is correct or it could not be found.`,
          );

        if (updateIdMap.has(item.rewardId))
          throw ErrorApiResponse.badRequest(
            `Reward voucher ID: ${item.rewardId} in update request is duplicated.`,
          );

        if (item.amount === existAmount)
          throw ErrorApiResponse.badRequest(
            `Update amount is the same as the existing amount in reward ID: ${item.rewardId}. `,
          );

        if (item.amount <= 0)
          throw ErrorApiResponse.conflictRequest(
            `The new update amount will cause the reward voucher amount to be 0. If desired request is to delete. Please make the delete request instead.`,
          );
        updateIdMap.set(item.rewardId, true);
      });
    }

    // REMOVE REWARD VOUCHERS
    if (removedRewardIds && removedRewardIds.length > 0) {
      if (removedRewardIds.length >= existRewardVouchers.length) {
        throw ErrorApiResponse.conflictRequest(
          `Package voucher must have at least one reward voucher. Desired delete amount: ${removedRewardIds.length}, Current reward voucher amount: ${existRewardVouchers.length}`,
        );
      }
      const removeVoucherIdMap = new Map<VoucherDomain['id'], boolean>();
      removedRewardIds.forEach((item) => {
        if (!rewardVoucherIdMap.has(item))
          throw ErrorApiResponse.conflictRequest(
            `Reward voucher ID: ${item} is not part of the package. Please check if the reward voucher ID is correct or it could not be found.`,
          );

        if (removeVoucherIdMap.has(item))
          throw ErrorApiResponse.conflictRequest(
            `Reward voucher ID: ${item} in remove request is duplicated.`,
          );

        removeVoucherIdMap.set(item, true);
      });
    }

    return;
  }

  async deletePackageVoucherById(
    packageId: PackageVoucherDomain['id'],
  ): Promise<void> {
    if (!packageId || !isUUID(packageId, 7))
      throw ErrorApiResponse.conflictRequest(
        `${packageId} is not the valid type of data for this request.`,
      );

    const isPackageExist =
      await this.packageVoucherRepository.findPackageVoucherById(packageId);

    if (!isPackageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${packageId} could not be found.`,
      );

    if (isPackageExist.deletedAt)
      throw ErrorApiResponse.conflictRequest(
        `Package ID: ${packageId} is already deleted.`,
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
    if (!files || files.length === 0)
      throw ErrorApiResponse.badRequest(
        `${PACKAGE_FILE_FIELD.PACKAGE_IMG} field is required for this request.`,
      );

    const isPackageExist =
      await this.packageVoucherRepository.findPackageVoucherById(id);
    if (!isPackageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${id} could not be found.`,
      );

    if (isPackageExist.deletedAt)
      throw ErrorApiResponse.conflictRequest(
        `Package ID: ${id} is already deleted.`,
      );

    const uploadedImgPath = await Promise.all(
      files.map((item) =>
        this.mediaService.uploadFile({
          file: item.buffer,
          fileName: item.filename,
          mimeType: item.mimetype,
          filePath: item.path,
          bucketDir: s3BucketDirectory.packageImg,
        }),
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
    const uploadedImgPath = await this.mediaService.uploadFile({
      file: file.buffer,
      fileName: file.filename,
      mimeType: file.mimetype,
      filePath: file.path,
      bucketDir: s3BucketDirectory.packageImg,
    });

    await this.mediaService.deleteFile(isPackageImgExist.imgPath);
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
