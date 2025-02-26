import { Injectable } from '@nestjs/common';
import {
  VoucherDomain,
  VoucherImgCreateInput,
  VoucherImgDomain,
} from './domain/voucher.domain';
import {
  UpdateVoucherRepositoryInput,
  VoucherImgRepository,
  VoucherRepository,
} from 'src/infrastructure/persistence/voucher/voucher.repository';
import { UUIDService } from '@utils/services/uuid.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { CreateVoucherDto } from './dto/vouchers/create-voucher.dto';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { NullAble } from '@utils/types/common.type';
import { UpdateVoucherDto } from './dto/vouchers/update-voucher.dto';
import {
  AddVoucherImgDto,
  UpdateVoucherImgDto,
} from './dto/voucher-img/voucher-img.dto';
import { VoucherDiscountCreateInput } from './domain/voucher-discount.domain';
import { isUUID } from 'class-validator';
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';
import { ProductDomainHelper } from 'src/common/product.helper';
import { GetManyVoucherQueries } from './dto/vouchers/get-voucher.dto';
import { ProductTypeEnum } from 'src/common/types/product.type';
import { VoucherTagService } from '@resources/category/tag/voucher-tag.service';
import { ObjectHelper } from '@utils/services/object.helper';
import { ProductStatusEnum } from '@resources/product/domain/product.domain';
import {
  ProductDiscountQueryEnum,
  ProductSellDateQueryEnum,
  ProductStatusQueryEnum,
} from '@resources/product/dto/get-product.dto';

@Injectable()
export class VoucherService {
  constructor(
    private voucherRepository: VoucherRepository,
    private voucherImgRepository: VoucherImgRepository,
    private voucherTagService: VoucherTagService,
    private uuidService: UUIDService,
    private mediaService: MediaService,
    private productDomainHelper: ProductDomainHelper,
  ) {}

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER PART ----------------------------- //
  // -------------------------------------------------------------------- //

  /**
   *  CREATE
   *  VOUCHER
   *  SERVICE
   *
   */
  public async createVoucher(
    data: CreateVoucherDto,
    mainImg: Express.Multer.File[],
    voucherImg: Express.Multer.File[],
  ): Promise<VoucherDomain> {
    if (!mainImg)
      throw ErrorApiResponse.badRequest('Main image for voucher is required.');
    // Check first if voucher tag exists or no
    const isTagExists = await this.voucherTagService.findById(data.tagId);
    if (!isTagExists)
      throw ErrorApiResponse.notFoundRequest(
        'The tag ID provided could not be found on this server.',
      );
    // Extract the term and condition from data
    const { discountedPrice, ...restData } = data;

    // ---------------------------------------------------------
    // ------------------ CREATE VOUCHER PART  ------------------
    //---------------------------------------------------------
    //---------------------------------------------------------
    const allImgBuffer: Express.Multer.File[] = [];

    allImgBuffer.push(...mainImg);

    if (voucherImg && voucherImg.length > 0) allImgBuffer.push(...voucherImg);

    if (allImgBuffer.length === 0)
      throw ErrorApiResponse.badRequest('Voucher image is required.');
    // Firstly we need to upload the img to s3 and get the link back.
    const allVoucherImgLinks = await Promise.all(
      allImgBuffer.map((item) =>
        this.mediaService.uploadFile({
          file: item.buffer,
          fileName: item.filename,
          filePath: item.path,
          mimeType: item.mimetype,
          bucketDir: s3BucketDirectory.voucherImg,
        }),
      ),
    );
    // ------- SECOND PART : SET UP INFORMATION -------

    // Set up the voucher information before store in database
    const voucherData = {
      ...restData,
      id: String(this.uuidService.make()),
      status: ProductStatusEnum.ACTIVE,
    };

    // If the voucher creating input
    // provided a promotion
    let voucherDiscountData: VoucherDiscountCreateInput;
    if (discountedPrice) {
      voucherDiscountData = {
        id: String(this.uuidService.make()),
        voucherId: voucherData.id,
        discountedPrice,
      };
    }
    // Set up the image before store in database
    const voucherImgToStore: VoucherImgCreateInput[] = allVoucherImgLinks.map(
      (item, index) => {
        if (index === 0)
          return {
            id: String(this.uuidService.make()),
            mainImg: true,
            imgPath: item,
            voucherId: voucherData.id,
          };
        return {
          id: String(this.uuidService.make()),
          mainImg: false,
          imgPath: item,
          voucherId: voucherData.id,
        };
      },
    );

    // ------- THIRD PART : CREATE VOUCHER  -------
    return this.voucherRepository.createVoucherAndTermAndImgAndPromotionTransaction(
      {
        voucherData,
        image: voucherImgToStore,
        voucherDiscount: voucherDiscountData,
      },
    );
  }

  public async getPaginationVoucher({
    tag,
    category,
    cursor,
    paginationOption,
    discount,
    sortOptions,
    status,
    sellDate,
  }: GetManyVoucherQueries): Promise<VoucherDomain[]> {
    const statusToQuery: GetManyVoucherQueries['status'] =
      this.checkVoucherStatusQuery(status);
    const sellDateQuery: GetManyVoucherQueries['sellDate'] =
      this.checkSellDateQuery(sellDate);
    const discountQuery: GetManyVoucherQueries['discount'] =
      this.checkDiscountQuery(discount);

    if (cursor) {
      if (!isUUID(cursor, 7))
        throw ErrorApiResponse.conflictRequest(
          `${cursor} is not valid data type for cursor.`,
        );
    }

    if (tag && !isUUID(tag))
      throw ErrorApiResponse.conflictRequest(
        `${tag} is not valid data type for tag.`,
      );

    return this.voucherRepository.findMany({
      tag,
      category,
      cursor,
      paginationOption,
      sortOptions,
      discount: discountQuery,
      status: statusToQuery,
      sellDate: sellDateQuery,
    });
  }

  public async getVoucherById(
    id: VoucherDomain['id'],
  ): Promise<NullAble<VoucherDomain>> {
    if (!id || !isUUID(id, 7))
      throw ErrorApiResponse.badRequest('Invalid ID format.');

    const voucher = await this.voucherRepository.findById(id);
    if (!voucher)
      throw ErrorApiResponse.notFoundRequest(
        `The voucher ID: ${id} could not be found on this server.`,
      );
    return voucher;
  }

  public async getVoucherByIds(
    idList: VoucherDomain['id'][],
  ): Promise<VoucherDomain[]> {
    if (idList.length < 1) return [];
    return this.voucherRepository.findByIds(idList);
  }

  public async getSearchedVoucher(
    searchContent: string,
    {
      sellDate,
      status,
      cursor,
    }: {
      sellDate: string;
      status: GetManyVoucherQueries['status'];
      cursor: VoucherDomain['id'];
    },
  ): Promise<NullAble<VoucherDomain[]>> {
    if (!searchContent) return [];

    if (cursor && !isUUID(cursor, 7))
      throw ErrorApiResponse.badRequest('Invalid cursor format.');
    const sellDateQuery = this.checkSellDateQuery(sellDate);
    const statusQuery = this.checkVoucherStatusQuery(status);
    return this.voucherRepository.findBySearchContent(searchContent, {
      sellDate: sellDateQuery,
      status: statusQuery,
      cursor,
    });
  }

  private checkVoucherStatusQuery(
    status: GetManyVoucherQueries['status'],
  ): ProductStatusQueryEnum {
    if (!status) {
      return ProductStatusQueryEnum.ACTIVE;
    }

    if (
      !EnumCheckerHelper.checkEnumValue(
        ProductStatusQueryEnum,
        status.toUpperCase(),
      )
    ) {
      throw ErrorApiResponse.badRequest(
        `${status} is not valid enumerable for status. Value provided should be one of the ${EnumCheckerHelper.allEnumValue(ProductStatusEnum).join(', ')} value`,
      );
    }
    return ProductStatusQueryEnum[status.toUpperCase()];
  }

  private checkSellDateQuery(sellQuery: string): ProductSellDateQueryEnum {
    return EnumCheckerHelper.getEnumValueOrThrow(
      ProductSellDateQueryEnum,
      sellQuery,
      ProductSellDateQueryEnum.NOW,
    );
  }

  private checkDiscountQuery(discount: string): ProductDiscountQueryEnum {
    return EnumCheckerHelper.getEnumValueOrThrow(
      ProductDiscountQueryEnum,
      discount,
      ProductDiscountQueryEnum.ALL,
    );
  }

  /**
   * Updates an existing voucher with the provided data.
   *
   * @param data UpdateVoucherDto - The updated data for the voucher.
   * @returns The updated VoucherDomain object.
   * @throws ErrorApiResponse.notFoundRequest if the voucher or tag is not found.
   */
  public async updateVoucher(data: UpdateVoucherDto): Promise<VoucherDomain> {
    // Find the voucher via id
    const voucher = await this.voucherRepository.findById(
      data.id,
      ProductDiscountQueryEnum.ALL,
    );

    // If the voucher does not exist, throw an error
    if (!voucher) {
      throw ErrorApiResponse.notFoundRequest(
        `The voucher ID: ${data.id} could not be found on this server`,
      );
    }

    // Validate the update data and check usable and sell time
    this.productDomainHelper.checkUpdateData(
      data,
      voucher,
      ProductTypeEnum.VOUCHER,
    );
    this.productDomainHelper.checkUsableAndSellTime(
      data,
      voucher,
      ProductTypeEnum.VOUCHER,
    );

    // Validate the existence of the tag ID
    if (data.tagId) {
      const tagId = await this.voucherTagService.findById(data.tagId);
      if (!tagId) {
        throw ErrorApiResponse.notFoundRequest(
          `The tag ID: ${data.tagId} could not be found on this server.`,
        );
      }
    }

    const { discount, ...voucherInfo } = data;
    const updateData: UpdateVoucherRepositoryInput = { ...voucherInfo };

    if (!ObjectHelper.isObjectEmpty(discount)) {
      if (
        ObjectHelper.isObjectEmpty(voucher.discount) ||
        !voucher.discount.id
      ) {
        updateData.discount = {
          create: {
            id: String(this.uuidService.make()),
            discountedPrice: discount.discountedPrice,
          },
        };
      } else {
        updateData.discount = {
          update: {
            ...discount,
            currentDiscountId: voucher.discount.id,
          },
        };
        if (discount.discountedPrice)
          updateData.discount.update.newId = String(this.uuidService.make());
      }
    }

    // Update the voucher with the new data
    return this.voucherRepository.update(updateData);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER IMAGE PART ----------------------- //
  // -------------------------------------------------------------------- //

  /**
   * Service for
   * finding all
   * voucher image
   * of specific
   * voucher ID
   */
  public async getAllVoucherImgByVoucherId(
    id: VoucherDomain['id'],
  ): Promise<NullAble<VoucherImgDomain[]>> {
    return this.voucherImgRepository.findManyByVoucherId(id);
  }

  /**
   * Service for
   * update specific
   * voucher image
   * via ID
   */
  public async addVoucherImg({
    data,
    voucherImg,
  }: {
    data?: AddVoucherImgDto;
    mainImg?: Express.Multer.File;
    voucherImg?: Express.Multer.File[];
  }): Promise<VoucherImgDomain[]> {
    if (!voucherImg || voucherImg.length === 0)
      throw ErrorApiResponse.notFoundRequest('voucherImg field is required.');
    const voucher = await this.voucherRepository.findById(data.voucherId);
    if (!voucher)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher ID: ${data.voucherId} could not be found on this server.`,
      );

    return this.createManyVoucherImg(voucher.id, voucherImg);
  }

  /**
   *
   * @param data VoucherImgCreateInput
   * @param file Express.Multer.File
   * @returns VoucherImgDomain
   */
  public async updateSpecificVoucherImg(
    data: UpdateVoucherImgDto,
    file: Express.Multer.File,
  ): Promise<VoucherImgDomain> {
    const voucher = await this.voucherRepository.findById(data.voucherId);

    if (!voucher)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher ID: ${data.voucherImgId} could not be found on this server.`,
      );

    const voucherImg = voucher.images.find(
      (item) => item.id === data.voucherImgId,
    );
    if (!voucherImg)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher image ID: ${data.voucherImgId} could not be found with the voucher ID: ${voucher.id}.`,
      );
    const imageLink = await this.mediaService.uploadFile({
      file: file.buffer,
      fileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      bucketDir: s3BucketDirectory.voucherImg,
    });
    const updatedVoucherImg = await this.voucherImgRepository.updateVoucherImg(
      data.voucherImgId,
      { imgPath: imageLink },
    );
    await this.mediaService.deleteFile(voucherImg.imgPath);
    return updatedVoucherImg;
  }

  /**
   * @param Express.Multer.File[]
   * @param voucherId
   * @returns null
   *
   * Service for
   * create many new
   * voucher image
   */
  private async createManyVoucherImg(
    voucherId: VoucherDomain['id'],
    data: Express.Multer.File[],
  ): Promise<VoucherImgDomain[]> {
    const voucherImgLink = await Promise.all(
      data.map((item) => {
        return this.mediaService.uploadFile({
          file: item.buffer,
          fileName: item.filename,
          filePath: item.path,
          mimeType: item.mimetype,
          bucketDir: s3BucketDirectory.voucherImg,
        });
      }),
    );
    const voucherImgToUpdate = voucherImgLink.map((item) => {
      return {
        id: String(this.uuidService.make()),
        imgPath: item,
        voucherId,
        mainImg: false,
      };
    });

    return this.voucherImgRepository.createMany(voucherImgToUpdate);
  }

  public async deleteVoucherImgById(
    voucherId: VoucherDomain['id'],
    imgId: VoucherImgDomain['id'],
  ): Promise<void> {
    if (!voucherId || !isUUID(voucherId))
      throw ErrorApiResponse.badRequest(
        `${voucherId} is not valid data type for this request.`,
      );

    if (!imgId || !isUUID(imgId))
      throw ErrorApiResponse.badRequest(
        `${imgId} is not valid data type for this request.`,
      );
    const voucher = await this.voucherRepository.findById(voucherId);

    if (!voucher)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher ID: ${voucherId} could not be found on this server.`,
      );

    const voucherImg = voucher.images.find((item) => item.id === imgId);

    if (!voucherImg)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher image ID: ${imgId} could not be found with the voucher ID: ${voucher.id}.`,
      );

    if (voucherImg.mainImg)
      throw ErrorApiResponse.conflictRequest(
        `This ID is the main image and can not be delete. Please update the image instead.`,
      );

    await this.voucherImgRepository.deleteById(imgId);
    await this.mediaService.deleteFile(voucherImg.imgPath);
    return;
  }

  // // -------------------------------------------------------------------- //
  // // ------------------------- VOUCHER DISCOUNT PART -------------------- //
  // // -------------------------------------------------------------------- //
  // async createVoucherDiscount(
  //   data: CreateVoucherDiscountDto,
  // ): Promise<VoucherDomain> {
  //   const isVoucherExist = await this.voucherRepository.findById(
  //     data.voucherId,
  //   );
  //   if (!isVoucherExist)
  //     throw ErrorApiResponse.notFoundRequest(
  //       `Voucher ID: ${isVoucherExist.id} does not exist on this server.`,
  //     );

  //   if (isVoucherExist.discount.id)
  //     throw ErrorApiResponse.conflictRequest(
  //       `Voucher ID: ${isVoucherExist.id} already has a discount. Discount price: ${isVoucherExist.discount.discountedPrice}. If desired to update the discount information of this voucher, Please request to the update endpoint.`,
  //     );

  //   this.productDomainHelper.checkUpdateData(
  //     data,
  //     isVoucherExist,
  //     ProductTypeEnum.VOUCHER,
  //   );

  //   data.id = String(this.uuidService.make());
  //   return this.voucherDiscountRepository.create(data);
  // }

  // async updateVoucherDiscount(
  //   data: UpdateVoucherDiscountDto,
  // ): Promise<VoucherDomain> {
  //   // Finding voucher via ID
  //   const isVoucherExist = await this.voucherRepository.findById(
  //     data.voucherId,
  //   );

  //   // If voucher ID provided in the request
  //   // could not be found on the server.
  //   if (!isVoucherExist)
  //     throw ErrorApiResponse.notFoundRequest(
  //       `Voucher ID: ${isVoucherExist.id} does not exist on this server.`,
  //     );

  //   if (!isVoucherExist.discount.id)
  //     throw ErrorApiResponse.conflictRequest(
  //       `Voucher ID: ${isVoucherExist.id} does not have a discount. Please request to the create endpoint first.`,
  //     );

  //   if (data.status)
  //     EnumCheckerHelper.checkEnumValue(data.status, VoucherDiscountStatusEnum);

  //   this.productDomainHelper.checkUpdateData(
  //     { discountedPrice: data.discountedPrice },
  //     isVoucherExist,
  //     ProductTypeEnum.VOUCHER,
  //   );

  //   return this.voucherDiscountRepository.update(data);
  // }
}
