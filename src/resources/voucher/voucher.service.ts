import { Injectable } from '@nestjs/common';
import { CreateVoucherCategoryDto } from './dto/voucher-category.dto';
import {
  CreateVoucherTagDto,
  UpdateVoucherTagDto,
} from './dto/voucher-tag.dto';
import {
  TermAndCondLangauage,
  VoucherCategoryDomain,
  VoucherDomain,
  VoucherDomainCreateInput,
  VoucherImgCreateInput,
  VoucherImgDomain,
  VoucherStatusEnum,
  VoucherTagDomain,
  VoucherTermAndCondCreateInput,
} from './domain/voucher.domain';
import {
  VoucherCategoryRepository,
  VoucherImgRepository,
  VoucherPromotionRepository,
  VoucherRepository,
  VoucherTagRepository,
} from 'src/infrastructure/persistence/voucher/voucher.repository';
import { UUIDService } from '@utils/services/uuid.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { CreateVoucherDto } from './dto/vouchers/create-voucher.dto';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { NullAble } from '@utils/types/common.type';
import {
  TermAndCondUpdateDto,
  UpdateVoucherDto,
} from './dto/vouchers/update-voucher.dto';
import {
  AddVoucherImgDto,
  UpdateVoucherImgDto,
  VOUCHER_FILE_FILED,
} from './dto/voucher-img/voucher-img.dto';
import {
  VoucherPromotionCreateInput,
  VoucherPromotionDomain,
} from './domain/voucher-promotion.domain';
import { CreateVoucherPromotionDto } from './dto/voucher-promotion/create-promotion.dto';
import { UpdateVoucherPromotionDto } from './dto/voucher-promotion/update-promotion.dto';
import { isUUID } from 'class-validator';
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';
import { ProductDomainHelper } from '@resources/account/dto/product.helper';
import { ObjectHelper } from '@utils/services/object.helper';
import { PaginationSellDateQueryEnum } from './dto/vouchers/get-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(
    private voucherRepository: VoucherRepository,
    private voucherTagRepository: VoucherTagRepository,
    private voucherCategoryRepository: VoucherCategoryRepository,
    private voucherImgRepository: VoucherImgRepository,
    private voucherPromotionRepository: VoucherPromotionRepository,
    private uuidService: UUIDService,
    private mediaService: MediaService,
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
    // Check first if voucher tag exists or no
    const isTagExists = await this.voucherTagRepository.findById(data.tagId);
    if (!isTagExists)
      throw ErrorApiResponse.notFoundRequest(
        'The tag ID provided could not be found on this server.',
      );
    // Extract the term and condition from data
    const { termAndCondTh, termAndCondEn, promotion, ...restData } = data;
    if (!ObjectHelper.isObjectEmpty(promotion)) {
      if (promotion.sellStartedAt < restData.sellStartedAt)
        throw ErrorApiResponse.badRequest(
          `Promotion should not sell earlier than voucher.`,
        );

      if (promotion.sellExpiredAt > restData.sellExpiredAt)
        throw ErrorApiResponse.badRequest(
          `Promotion should stop selling before or the same time as the voucher.`,
        );

      if (promotion.usableAt < restData.usableAt)
        throw ErrorApiResponse.badRequest(
          `Promotion should be usable the same time or later than voucher.`,
        );
    }

    // ---------------------------------------------------------
    // ------------------ CREATE VOUCHER PART  ------------------
    //---------------------------------------------------------
    //---------------------------------------------------------
    const allImgBuffer: Express.Multer.File[] = [];
    if (!mainImg)
      throw ErrorApiResponse.badRequest('Main image for voucher is required.');

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
    const voucherData: VoucherDomainCreateInput = {
      ...restData,
      id: String(this.uuidService.make()),
      status: VoucherStatusEnum.ACTIVE,
    };

    // Set up the Thai Term and condition before store in database
    const termAndCondThWithVoucherId: VoucherTermAndCondCreateInput[] =
      termAndCondTh.map((item) => {
        return {
          id: String(this.uuidService.make()),
          voucherId: voucherData.id,
          description: item,
        };
      });

    // Set up the English Term and condition before store in database
    const termAndCondEnWithVoucherId: VoucherTermAndCondCreateInput[] =
      termAndCondEn.map((item) => {
        return {
          id: String(this.uuidService.make()),
          voucherId: voucherData.id,
          description: item,
        };
      });

    // If the voucher creating input
    // provided a promotion
    let promotionData: VoucherPromotionCreateInput;
    if (promotion && Object.keys(promotion).length > 0) {
      promotionData = {
        ...promotion,
        id: String(this.uuidService.make()),
        voucherId: voucherData.id,
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
        termAndCondThArr: termAndCondThWithVoucherId,
        termAndCondEnArr: termAndCondEnWithVoucherId,
        image: voucherImgToStore,
        promotion: promotionData,
      },
    );
  }

  public async getPaginationVoucher({
    tag,
    category,
    cursor,
    paginationOption,
    sortOption,
    status,
    sellDate,
  }: {
    tag?: VoucherTagDomain['name'];
    category?: VoucherCategoryDomain['name'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    sortOption?: unknown;
    status?: VoucherDomain['status'];
    sellDate?: string;
  }): Promise<VoucherDomain[]> {
    const statusToQuery: VoucherStatusEnum =
      this.checkVoucherStatusQuery(status);
    const sellDateQuery: PaginationSellDateQueryEnum =
      this.checkSellDateQuery(sellDate);

    if (cursor) {
      if (!isUUID(cursor, 7))
        throw ErrorApiResponse.conflictRequest(
          `${cursor} is not valid data type for cursor.`,
        );

      const isVoucherExist = await this.voucherRepository.findById(cursor);
      if (!isVoucherExist)
        throw ErrorApiResponse.notFoundRequest(
          `Voucher ID: ${cursor} does not exist on this server.`,
        );
    }

    return this.voucherRepository.findMany({
      tag,
      category,
      cursor,
      paginationOption,
      sortOption,
      status: statusToQuery,
      sellDate: sellDateQuery,
    });
  }

  public async getVoucherById(
    id: VoucherDomain['id'],
  ): Promise<NullAble<VoucherDomain>> {
    if (!id) return null;

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
    { sellDate, status }: { sellDate: string; status: VoucherDomain['status'] },
  ): Promise<NullAble<VoucherDomain[]>> {
    const sellDateQuery = this.checkSellDateQuery(sellDate);
    const statusQuery = this.checkVoucherStatusQuery(status);
    return this.voucherRepository.findBySearchContent(searchContent, {
      sellDate: sellDateQuery,
      status: statusQuery,
    });
  }

  private checkVoucherStatusQuery(
    status: VoucherDomain['status'],
  ): VoucherStatusEnum {
    if (!status) {
      return VoucherStatusEnum.ACTIVE;
    }

    if (
      !EnumCheckerHelper.checkEnumValue(VoucherStatusEnum, status.toUpperCase())
    ) {
      throw ErrorApiResponse.badRequest(
        `${status} is not valid enumerable for status. Value provided should be one of the ${EnumCheckerHelper.allEnumValue(VoucherStatusEnum).join(', ')} value`,
      );
    }
    return VoucherStatusEnum[status.toUpperCase()];
  }

  private checkSellDateQuery(sellQuery: string): PaginationSellDateQueryEnum {
    if (!sellQuery) return PaginationSellDateQueryEnum.NOW;

    if (
      !EnumCheckerHelper.checkEnumValue(
        PaginationSellDateQueryEnum,
        sellQuery.toUpperCase(),
      )
    ) {
      throw ErrorApiResponse.badRequest(
        `${sellQuery} is now not valid data type for finding sell date. Value provided should be one of these value: ${EnumCheckerHelper.allEnumValue(PaginationSellDateQueryEnum).join(', ')}`,
      );
    }

    return PaginationSellDateQueryEnum[sellQuery.toUpperCase()];
  }

  /**
   * Service for updating
   * existing voucher.
   */
  public async updateVoucher(data: UpdateVoucherDto): Promise<VoucherDomain> {
    // Find the voucher via id
    const voucher = await this.voucherRepository.findById(data.id);

    // If the voucher does not exist
    // throw the error.
    if (!voucher)
      throw ErrorApiResponse.notFoundRequest(
        `The voucher ID: ${data.id} could not be found on this server`,
      );

    if (data.status == voucher.status)
      throw ErrorApiResponse.conflictRequest(
        `The voucher ID: ${voucher.id} is already ${data.status}`,
      );

    if (data.termAndCondTh) {
      await this.checkVoucherTermAndCondBeforeUpdate(
        data.termAndCondTh,
        TermAndCondLangauage.TH,
      );
    }

    if (data.termAndCondEn) {
      await this.checkVoucherTermAndCondBeforeUpdate(
        data.termAndCondEn,
        TermAndCondLangauage.EN,
      );
    }

    if (data.tagId) {
      const tagId = await this.voucherTagRepository.findById(data.tagId);
      if (!tagId)
        throw ErrorApiResponse.notFoundRequest(
          `The tag ID: ${data.tagId} could not be found on this server.`,
        );
    }

    ProductDomainHelper.checkUsableAndSellTime(data, voucher, 'voucher');

    return this.voucherRepository.update(data);
  }

  // ------------------------- VOUCHER TERM AND COND PART --------------- //
  public async checkVoucherTermAndCondBeforeUpdate(
    data: TermAndCondUpdateDto[],
    lang: TermAndCondLangauage,
  ) {
    const actionMap = new Map<string, TermAndCondUpdateDto>();
    const allTermAndCondId = data.map((item) => {
      if (actionMap.get(item.id)) {
        throw ErrorApiResponse.conflictRequest(
          `Please provide only one action per term and condition ID as ID: ${item.id} is duplicate in request.`,
        );
      }
      actionMap.set(item.id, item);

      return item.id;
    });
    const termAndCondList =
      await this.voucherRepository.findManyTermAndConditionWithIds(
        allTermAndCondId,
        lang,
      );
    if (termAndCondList.length !== allTermAndCondId.length) {
      throw ErrorApiResponse.conflictRequest(
        `The term and condition of language: ${lang} ID ${allTermAndCondId.filter((item) => !termAndCondList.map((item) => item.id).includes(item)).join(', ')} could not be found on this server.`,
      );
    }

    termAndCondList.forEach((item) => {
      if (actionMap.get(item.id).inactive && item.inactiveAt) {
        throw ErrorApiResponse.conflictRequest(
          `The term and condition ID: ${item.id} has already been inactive.`,
        );
      }

      if (actionMap.get(item.id).inactive === false) {
        throw ErrorApiResponse.conflictRequest(
          `Please provided inactive value as a boolean to set ID: ${item.id} as inactive.`,
        );
      }
    });
  }

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER TAG PART ------------------------- //
  // -------------------------------------------------------------------- //

  /**
   * Service for create voucher tag.
   *
   */
  public async createVoucherTag(
    data: CreateVoucherTagDto,
  ): Promise<VoucherTagDomain> {
    const voucherCategory = await this.voucherCategoryRepository.findById(
      data.categoryId,
    );
    if (!voucherCategory) {
      throw ErrorApiResponse.notFoundRequest(
        'The category ID you request could not be found on this server.',
      );
    }
    const createInput: Omit<
      VoucherTagDomain,
      'createdAt' | 'updatedAt' | 'deletedAt'
    > = {
      id: String(this.uuidService.make()),
      name: data.name,
      categoryId: data.categoryId,
    };
    return this.voucherTagRepository.create(createInput);
  }

  public async getPaginationVoucherTag({
    category,
    cursor,
    paginationOption,
    sortOption,
  }: {
    category?: VoucherCategoryDomain['name'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherTagDomain['id'];
    sortOption?: unknown;
  }) {
    return this.voucherTagRepository.findMany({
      category,
      cursor,
      paginationOption,
      sortOption,
    });
  }

  public async updateVoucherTag(
    data: UpdateVoucherTagDto,
  ): Promise<VoucherTagDomain> {
    const isVoucherTagExist: VoucherTagDomain =
      await this.voucherTagRepository.findById(data.tagId);
    if (!isVoucherTagExist)
      throw ErrorApiResponse.notFoundRequest(
        `The tag ID: ${data.tagId} could not be found on this server.`,
      );
    const isCategoryExist: VoucherCategoryDomain =
      await this.voucherCategoryRepository.findById(data.updateCategoryId);
    if (!isCategoryExist)
      throw ErrorApiResponse.notFoundRequest(
        `The voucher category ID: ${data.updateCategoryId} could not be found on this server.`,
      );
    const { tagId, ...rest } = data;
    const input:
      | Partial<VoucherTagDomain>
      | (Partial<VoucherTagDomain> & {
          categoryId: VoucherCategoryDomain['id'];
        }) = { ...rest };
    if (rest.updateCategoryId) {
      input.categoryId = rest.updateCategoryId;
    }
    return this.voucherTagRepository.update(tagId, input);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER CATEGORY PART -------------------- //
  // -------------------------------------------------------------------- //

  /**
   * Create voucher category
   */
  public createVoucherCategory(
    data: CreateVoucherCategoryDto,
  ): Promise<VoucherCategoryDomain> {
    const createInput: Omit<
      VoucherCategoryDomain,
      'createdAt' | 'updatedAt' | 'deletedAt'
    > = {
      id: String(this.uuidService.make()),
      name: data.name,
    };
    return this.voucherCategoryRepository.create(createInput);
  }

  /**
   * Service for
   * finding many
   * voucher category
   * via pagination which
   * can provide
   * cursor and page
   * to paginated
   */
  public getPaginationVoucherCategory(): Promise<
    NullAble<VoucherCategoryDomain[]>
  > {
    return this.voucherCategoryRepository.findManyWithPagination({});
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

    const voucherImg = voucher.img.find(
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

    const voucherImg = voucher.img.find((item) => item.id === imgId);

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

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER PROMOTION PART ----------------------------- //
  // -------------------------------------------------------------------- //
  async createVoucherPromotion(
    data: CreateVoucherPromotionDto,
  ): Promise<VoucherPromotionDomain> {
    const isVoucherExist = await this.voucherRepository.findById(
      data.voucherId,
    );
    if (!isVoucherExist)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher ID: ${isVoucherExist.id} does not exist on this server.`,
      );
    if (isVoucherExist.price < data.promotionPrice) {
      throw ErrorApiResponse.conflictRequest(
        `The promotion price: ${data.promotionPrice} should not be more expensive than the original price: ${isVoucherExist.price}`,
      );
    }
    data['id'] = this.uuidService.make();
    return this.voucherPromotionRepository.createPromotion(data);
  }

  async getPaginationVoucherPromotion({
    cursor,
    name,
  }: {
    cursor?: VoucherPromotionDomain['id'];
    name?: VoucherPromotionDomain['name'];
  }): Promise<NullAble<VoucherPromotionDomain>[]> {
    return this.voucherPromotionRepository.findMany({ cursor, name });
  }

  async getVoucherPromotionById(
    promotionId: VoucherPromotionDomain['id'],
  ): Promise<NullAble<VoucherPromotionDomain>> {
    return this.voucherPromotionRepository.findById(promotionId);
  }

  async updateVoucherPromotion(
    data: UpdateVoucherPromotionDto,
  ): Promise<VoucherPromotionDomain> {
    // Finding voucher via ID
    const isVoucherExist = await this.voucherRepository.findById(
      data.voucherId,
    );

    // If voucher ID provided in the request
    // could not be found on the server.
    if (!isVoucherExist)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher ID: ${isVoucherExist.id} does not exist on this server.`,
      );

    const isVoucherPromotionExist =
      await this.voucherPromotionRepository.findById(data.promotionId);

    // If promotion ID provided in the request
    // could not be found on the server.
    if (!isVoucherPromotionExist)
      throw ErrorApiResponse.notFoundRequest(
        `Promotion ID: ${isVoucherPromotionExist.id} does not exist on this server.`,
      );

    // If the new promotion price is more expensive than original price
    // it should not be updatable.
    if (data.promotionPrice) {
      if (isVoucherExist.price < data.promotionPrice) {
        throw ErrorApiResponse.conflictRequest(
          `The promotion price: ${data.promotionPrice} should not be more expensive than the original price: ${isVoucherExist.price}`,
        );
      }
    }

    // If the request data want to change the promotion start selling Date
    // should check with the existing promotion date first.
    // if greater, than it could not proceed any further.
    if (data.sellStartedAt) {
      if (data.sellStartedAt > isVoucherPromotionExist.sellExpiredAt) {
        throw ErrorApiResponse.conflictRequest(
          `The updated promotion start-selling date :: ${data.sellStartedAt} should not be greater than the existing stop-selling date: ${isVoucherPromotionExist.sellExpiredAt}`,
        );
      }
    }

    ProductDomainHelper.checkUsableAndSellTime(
      data,
      isVoucherPromotionExist,
      'promotion',
    );

    return this.voucherPromotionRepository.updatePromotion(data);
  }

  async deleteVoucherPromotion(
    voucherPromotionId: VoucherPromotionDomain['id'],
  ): Promise<void> {
    const isVoucherPromotionExist =
      await this.voucherPromotionRepository.findById(voucherPromotionId);

    // If promotion ID provided in the request
    // could not be found on the server.
    if (!isVoucherPromotionExist)
      throw ErrorApiResponse.notFoundRequest(
        `Promotion ID: ${isVoucherPromotionExist.id} does not exist on this server.`,
      );

    // If promotion ID provided in the request
    // has already been deleted.
    if (isVoucherPromotionExist.deletedAt) {
      throw ErrorApiResponse.conflictRequest(
        `Promotion ID: ${isVoucherPromotionExist.id} has already been deleted since ${isVoucherPromotionExist.deletedAt.toLocaleString()}`,
      );
    }
    await this.voucherPromotionRepository.deletePromotion(voucherPromotionId);
    return;
  }
}
