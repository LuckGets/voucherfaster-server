import { Injectable, Logger } from '@nestjs/common';
import {
  PackageVoucherCreateInput,
  PackageVoucherDiscountNestedCreateInput,
  PackageVoucherRepository,
  UpdatePackageVoucherRepositoryInput,
} from 'src/infrastructure/persistence/package/package.repository';
import {
  CreatePackageVoucherDto,
  PACKAGE_FILE_FIELD,
} from './dto/create-package.dto';
import {
  PackageImgCreateInput,
  PackageImgDomain,
  PackageQuotaVoucherDomain,
  PackageRewardVoucherCreateInput,
  PackageRewardVoucherDomain,
  PackageVoucherDomain,
} from './domain/package-voucher.domain';
import { MediaService } from '@application/media/media.service';
import { UUIDService } from '@utils/services/uuid.service';
import { VoucherService } from '@resources/voucher/voucher.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { isUUID } from 'class-validator';
import { NullAble } from '@utils/types/common.type';

import { UpdatePackageVoucherDto } from './dto/update-package.dto';
import { PackageImgRepository } from 'src/infrastructure/persistence/package/package-img.repository';
import { ProductDomainHelper } from 'src/common/product.helper';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import {
  PackageDiscountQueryEnum,
  PackageSellDateQueryEnum,
  PackageStatusQueryEnum,
} from './dto/get-package.dto';
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';
import { ProductTypeEnum } from 'src/common/types/product.type';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { VoucherTagService } from '@resources/category/tag/voucher-tag.service';
import { AddNewPackageQuotaVoucherDto } from './dto/quota/add-quota.dto';
import { UpdateQuotaVoucherDto } from './dto/quota/update-quota.dto';
import { AddNewPackageRewardVoucherDto } from './dto/reward/add-reward.dto';
import { UpdateRewardVoucherDto } from './dto/reward/update-reward.dto';
import e from 'express';
import { ProductStatusEnum } from '@resources/product/domain/product.domain';

@Injectable()
export class PackageVoucherService {
  constructor(
    private logger: Logger,
    private packageVoucherRepository: PackageVoucherRepository,
    private packageImgRepository: PackageImgRepository,
    private voucherService: VoucherService,
    private voucherTagService: VoucherTagService,
    private uuidService: UUIDService,
    private mediaService: MediaService,
    private prductDomainHelper: ProductDomainHelper,
  ) {}

  // CREATE PACKAGE VOUCHER PATH //
  async createPackageVoucher({
    data,
    packageImg,
  }: {
    data: CreatePackageVoucherDto;
    packageImg: Express.Multer.File[];
  }): Promise<PackageVoucherDomain> {
    const isTagExist = await this.voucherTagService.findById(data.tagId);

    if (!isTagExist)
      throw ErrorApiResponse.badRequest(
        `Tag ID: ${data.tagId} could not be found.`,
      );

    const filesAndFieldsMap = this.parseFileAndFields(packageImg);

    const mainImgFile = filesAndFieldsMap.get('main') || [];

    const mainImgAndPackageBuffer: Express.Multer.File[] = [
      ...mainImgFile,
      ...(filesAndFieldsMap.get('package') || []),
    ];

    const mainImgAndPackageLength = mainImgAndPackageBuffer.length;

    // Extract reward voucher ID from package voucher data
    const { rewardVouchers, discountedPrice, ...restData } = data;
    const packageId: PackageVoucherDomain['id'] = String(
      this.uuidService.make(),
    );

    const { allImgBuffer, idList, imgIndexAndTypeMap, rewardVoucherData } =
      this.prepareRewardVouchers({
        filesAndFieldsMap,
        mainImgAndPackageBuffer,
        packageId,
        quotaVouchers: data.quotaVouchers,
        rewardVouchers,
      });

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

    if (allImgBuffer.length < 1)
      throw ErrorApiResponse.conflictRequest('There is no image for upload.');
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

    const packageData: PackageVoucherCreateInput = {
      id: packageId,
      ...restData,
    };
    // attached package reward voucher image.

    if (allPackageImgLinks.length > mainImgAndPackageLength) {
      rewardVoucherData.forEach((data) => {
        const imgIndex = imgIndexAndTypeMap.get(data.rewardVoucherId);
        if (imgIndex) {
          data.img = allPackageImgLinks[imgIndex];
        }
      });
      allPackageImgLinks.splice(
        mainImgAndPackageLength,
        allPackageImgLinks.length - mainImgAndPackageLength,
      );
    }

    const packageImgCreateData: PackageImgCreateInput[] =
      allPackageImgLinks.map((item, index) => {
        return {
          id: String(this.uuidService.make()),
          packageId: packageData.id,
          imgPath: item,
          mainImg: index === 0,
        };
      });

    let discountedData: PackageVoucherDiscountNestedCreateInput;

    if (discountedPrice)
      discountedData = {
        id: String(this.uuidService.make()),
        discountedPrice: discountedPrice,
      };

    return this.packageVoucherRepository.createPackageVoucher({
      packageVoucherCreateInput: packageData,
      packageImage: packageImgCreateData,
      packageRewardVoucher: rewardVoucherData,
      packageDiscount: discountedData,
    });
  }

  private parseFileAndFields(packageImg: Express.Multer.File[]) {
    const filesAndFieldsMap = new Map<
      string | 'main' | 'package',
      Express.Multer.File[]
    >();

    for (const file of packageImg) {
      switch (file.fieldname) {
        case PACKAGE_FILE_FIELD.MAIN_IMG:
          if (ObjectHelper.isObjectEmpty(file))
            throw ErrorApiResponse.badRequest(
              'Main image for voucher is required.',
            );
          const existingMainFile = filesAndFieldsMap.get('main') || [];

          if (existingMainFile && existingMainFile.length > 0)
            throw ErrorApiResponse.badRequest('Only one main image is allowed');
          filesAndFieldsMap.set('main', [file]);
          break;
        case PACKAGE_FILE_FIELD.PACKAGE_IMG:
          const packageFileArr = filesAndFieldsMap.get('package') || [];
          packageFileArr.push(file);
          filesAndFieldsMap.set('package', packageFileArr);
          break;
        default:
          const existingFileArr = filesAndFieldsMap.get(file.fieldname) || [];
          if (existingFileArr.length > 0)
            throw ErrorApiResponse.badRequest(
              `Only one file of ID:${file.fieldname} is allowed`,
            );
          else filesAndFieldsMap.set(file.fieldname, [file]);
      }
    }

    const mainImgFile = filesAndFieldsMap.get('main') || [];
    if (mainImgFile.length !== 1)
      throw ErrorApiResponse.badRequest('Main image for voucher is required.');
    return filesAndFieldsMap;
  }

  private prepareRewardVouchers({
    quotaVouchers,
    rewardVouchers,
    filesAndFieldsMap,
    mainImgAndPackageBuffer,
    packageId,
  }: {
    quotaVouchers: CreatePackageVoucherDto['quotaVouchers'];
    rewardVouchers: CreatePackageVoucherDto['rewardVouchers'];
    filesAndFieldsMap: Map<string | 'main' | 'package', Express.Multer.File[]>;
    mainImgAndPackageBuffer: Express.Multer.File[];
    packageId: PackageVoucherDomain['id'];
  }): {
    rewardVoucherData: PackageRewardVoucherCreateInput[];
    idList: VoucherDomain['id'][];
    imgIndexAndTypeMap: Map<VoucherDomain['id'], number>;
    allImgBuffer: Express.Multer.File[];
  } {
    const allImgBuffer = [...mainImgAndPackageBuffer];
    const imgIndexAndTypeMap = new Map<VoucherDomain['id'], number>();
    const voucherIdMap = new Map<VoucherDomain['id'], 'quota' | 'reward'>();
    const rewardVoucherData: PackageRewardVoucherCreateInput[] = [];
    // Extract reward voucher ID from package voucher data
    const idList = [];
    const allVouchers = [...quotaVouchers, ...rewardVouchers];
    const quotaVouchersLength = quotaVouchers.length;
    for (let i = 0; i < allVouchers.length; i++) {
      const voucherType = i < quotaVouchersLength ? 'quota' : 'reward';
      const item = allVouchers[i];
      const isVoucherExistInMap = voucherIdMap.get(item.voucherId);
      if (isVoucherExistInMap && isVoucherExistInMap === voucherType)
        throw ErrorApiResponse.badRequest(
          `${voucherType} voucher ID: ${item.voucherId} was duplicated. If desired to add more amount of the same voucher, please add the number in the amount of the desired voucher ID field.`,
        );

      if (filesAndFieldsMap.has(item.voucherId)) {
        allImgBuffer.push(...filesAndFieldsMap.get(item.voucherId));
        imgIndexAndTypeMap.set(item.voucherId, allImgBuffer.length - 1);
      }

      voucherIdMap.set(item.voucherId, voucherType);

      if (voucherType === 'reward') {
        rewardVoucherData.push({
          id: String(this.uuidService.make()),
          amount: item.amount,
          packageId,
          rewardVoucherId: item.voucherId,
        });
      }

      if (!isVoucherExistInMap) idList.push(item.voucherId);
    }
    const filesFieldName = Array.from(filesAndFieldsMap.keys());

    for (const field of filesFieldName) {
      if (field === 'main' || field === 'package') continue;
      if (!voucherIdMap.has(field))
        throw ErrorApiResponse.badRequest(
          `The file-assigned voucher ID: ${field} could not be found on to-be create reward vouchers list.`,
        );
    }

    return {
      rewardVoucherData,
      idList,
      allImgBuffer,
      imgIndexAndTypeMap,
    };
  }

  // FINISH CREATE PACKAGE

  async getAllPackageVoucher({
    category,
    cursor,
    status,
    sellDate,
    tag,
    discount,
  }: {
    cursor?: PackageVoucherDomain['id'];
    category?: CategoryDomain['name'];
    status?: PackageStatusQueryEnum;
    sellDate?: PackageSellDateQueryEnum;
    tag?: VoucherTagDomain['id'];
    discount?: PackageDiscountQueryEnum;
  }): Promise<PackageVoucherDomain[]> {
    const statusToQuery = this.checkStatusQuery(status);
    const sellDateQuery = this.checkSellDateQuery(sellDate);
    const discoutQuery = this.checkDiscountQuery(discount);
    if (cursor && !isUUID(cursor))
      throw ErrorApiResponse.badRequest(
        `Cursor: ${cursor} is not valid data type for searching.`,
      );

    if (tag && !isUUID(tag))
      throw ErrorApiResponse.badRequest(
        `Tag: ${tag} is not valid data type for searching.`,
      );

    return this.packageVoucherRepository.findManyPackageVoucher({
      cursor,
      category,
      status: statusToQuery,
      sellDate: sellDateQuery,
      tag,
      discount: discoutQuery,
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

  private checkDiscountQuery(
    discount: PackageDiscountQueryEnum,
  ): PackageDiscountQueryEnum {
    return EnumCheckerHelper.getEnumValueOrThrow(
      PackageDiscountQueryEnum,
      discount,
      PackageDiscountQueryEnum.ALL,
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
    const isPackageExist =
      await this.packageVoucherRepository.findPackageVoucherById(data.id);
    if (!isPackageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${data.id} could not be found.`,
      );

    // Check the update date data if provided
    this.prductDomainHelper.checkUsableAndSellTime(
      data,
      isPackageExist,
      ProductTypeEnum.PACKAGE,
    );

    // Check the other update data if provided
    this.prductDomainHelper.checkUpdateData(
      data,
      isPackageExist,
      ProductTypeEnum.PACKAGE,
    );

    const { discount, ...packageInfo } = data;

    const updatePackageData: UpdatePackageVoucherRepositoryInput = packageInfo;

    if (!ObjectHelper.isObjectEmpty(discount)) {
      if (
        ObjectHelper.isObjectEmpty(isPackageExist.discount) ||
        !isPackageExist.discount.id
      ) {
        updatePackageData.discount = {
          create: {
            id: String(this.uuidService.make()),
            discountedPrice: discount.discountedPrice,
          },
        };
      } else if (!ObjectHelper.isObjectEmpty(isPackageExist.discount)) {
        updatePackageData.discount = {
          update: {
            ...discount,
            currentDiscountId: isPackageExist.discount.id,
          },
        };
        if (discount.discountedPrice)
          updatePackageData.discount.update.newId = String(
            this.uuidService.make(),
          );
      }
    }

    return this.packageVoucherRepository.updatePackageVoucher(
      updatePackageData,
    );
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

    if (isPackageExist.status === ProductStatusEnum.INACTIVE)
      throw ErrorApiResponse.conflictRequest(
        `Package ID: ${packageId} is already inactive.`,
      );

    return this.packageVoucherRepository.deletePackageVoucherById(packageId);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- PACKAGE QUOTA PART ----------------------- //
  // -------------------------------------------------------------------- //

  public async addNewQuotaVoucher(
    body: AddNewPackageQuotaVoucherDto,
  ): Promise<PackageVoucherDomain> {
    const isPackageExist =
      await this.packageVoucherRepository.findPackageVoucherById(
        body.packageId,
      );

    if (!isPackageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${body.packageId} could not be found.`,
      );

    const isNewVoucherExist = await this.voucherService.getVoucherById(
      body.voucherId,
    );

    if (!isNewVoucherExist)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher ID: ${body.voucherId} could not be found.`,
      );

    const isNewVoucherAlreadyQuota = isPackageExist.quotaVouchers.find(
      (quotaVoucher) => quotaVoucher.voucherId === body.voucherId,
    );

    if (!ObjectHelper.isObjectEmpty(isNewVoucherAlreadyQuota))
      throw ErrorApiResponse.conflictRequest(
        `Voucher ID: ${body.voucherId} is already in the quota list. If desired to add the amount, please request to update endpoint.`,
      );

    return this.packageVoucherRepository.addNewQuotaVoucher(body);
  }

  public async updateQuotaVoucher(
    body: UpdateQuotaVoucherDto,
  ): Promise<PackageVoucherDomain> {
    await this.checkUpdateDataForPackageQuotaOrReward(body);

    return this.packageVoucherRepository.updateQuotaVoucher(body);
  }

  public async deleteQuotaVoucher(
    quotaId: PackageQuotaVoucherDomain['id'],
  ): Promise<void> {
    await this.checkQuotaOrRewardBeforeDelete(quotaId, 'Quota');

    return this.packageVoucherRepository.deleteQuotaVoucher(quotaId);
  }
  // -------------------------------------------------------------------- //
  // ------------------------- PACKAGE REWARD PART ---------------------- //
  // -------------------------------------------------------------------- //

  // ----- Package quota and reward utils service ---- //
  public async checkUpdateDataForPackageQuotaOrReward(
    updateData: UpdateQuotaVoucherDto | UpdateRewardVoucherDto,
  ): Promise<void> {
    let typeOfVoucherToUpdate: 'Quota' | 'Reward';
    let vouchers: PackageQuotaVoucherDomain | PackageRewardVoucherDomain;
    let idToUpdate: string;

    if (updateData instanceof UpdateQuotaVoucherDto) {
      idToUpdate = updateData.quotaId;
      vouchers = await this.packageVoucherRepository.findQuotaById(
        updateData.quotaId,
      );
    } else if (updateData instanceof UpdateRewardVoucherDto) {
      idToUpdate = updateData.rewardId;
      vouchers = await this.packageVoucherRepository.findRewardById(
        updateData.rewardId,
      );
    }

    if (!vouchers || vouchers.deletedAt)
      throw ErrorApiResponse.notFoundRequest(
        `${typeOfVoucherToUpdate} ID: ${idToUpdate} could not be found or has been deleted.`,
      );

    if (updateData.updateVoucherId) {
      const isNewVoucherExist = await this.voucherService.getVoucherById(
        updateData.updateVoucherId,
      );

      if (!isNewVoucherExist)
        throw ErrorApiResponse.notFoundRequest(
          `Voucher ID: ${updateData.updateVoucherId} could not be found.`,
        );

      if (vouchers.voucherId === updateData.updateVoucherId)
        throw ErrorApiResponse.badRequest(
          `Update ${typeOfVoucherToUpdate} voucher : ${updateData.updateVoucherId} is the same as existing ${typeOfVoucherToUpdate} voucher : ${vouchers.id}.`,
        );
    }

    if (updateData.updateAmount) {
      if (vouchers.amount === updateData.updateAmount)
        throw ErrorApiResponse.badRequest(
          `Update ${typeOfVoucherToUpdate} amount : ${updateData.updateAmount} is the same as existing ${typeOfVoucherToUpdate} amount : ${vouchers.amount}.`,
        );
    }
    return;
  }

  public async checkQuotaOrRewardBeforeDelete(
    id: PackageQuotaVoucherDomain['id'] | PackageRewardVoucherDomain['id'],
    typeOfVoucher: 'Quota' | 'Reward',
  ): Promise<void> {
    let vouchers: PackageQuotaVoucherDomain | PackageRewardVoucherDomain;
    if (!id || !isUUID(id, 7))
      throw ErrorApiResponse.badRequest(
        `${id} is not the valid type of data for this request.`,
      );

    switch (typeOfVoucher) {
      case 'Quota':
        vouchers = await this.packageVoucherRepository.findQuotaById(id);
        break;
      case 'Reward':
        vouchers = await this.packageVoucherRepository.findRewardById(id);
        break;
    }

    if (!vouchers || vouchers.deletedAt)
      throw ErrorApiResponse.notFoundRequest(
        `${typeOfVoucher} ID: ${id} could not be found or has been deleted.`,
      );
  }
  // ----- Package quota and reward utils service ---- //

  public async addNewRewardVoucher(
    body: AddNewPackageRewardVoucherDto,
  ): Promise<PackageVoucherDomain> {
    const isPackageExist =
      await this.packageVoucherRepository.findPackageVoucherById(
        body.packageId,
      );

    if (!isPackageExist)
      throw ErrorApiResponse.notFoundRequest(
        `Package ID: ${body.packageId} could not be found.`,
      );

    const isNewVoucherExist = await this.voucherService.getVoucherById(
      body.voucherId,
    );

    if (!isNewVoucherExist)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher ID: ${body.voucherId} could not be found.`,
      );

    const isNewVoucherAlreadyReward = isPackageExist.rewardVouchers.find(
      (rewardVoucher) => rewardVoucher.voucherId === body.voucherId,
    );

    if (!ObjectHelper.isObjectEmpty(isNewVoucherAlreadyReward))
      throw ErrorApiResponse.conflictRequest(
        `Voucher ID: ${body.voucherId} is already in the reward list. If desired to add the amount, please request to update endpoint.`,
      );

    return this.packageVoucherRepository.addNewRewardVoucher(body);
  }

  public async updateRewardVoucher(
    body: UpdateRewardVoucherDto,
  ): Promise<PackageVoucherDomain> {
    await this.checkUpdateDataForPackageQuotaOrReward(body);

    return this.packageVoucherRepository.updateRewardVoucher(body);
  }

  public async deleteRewardVoucher(
    id: PackageRewardVoucherDomain['id'],
  ): Promise<void> {
    await this.checkQuotaOrRewardBeforeDelete(id, 'Reward');
    return this.packageVoucherRepository.deleteRewardVoucher(id);
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

    // if (isPackageExist.status === PackageStatusEnum.INACTIVE)
    //   throw ErrorApiResponse.conflictRequest(
    //     `Package ID: ${id} is now ${isPackageExist.status}.`,
    //   );

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
