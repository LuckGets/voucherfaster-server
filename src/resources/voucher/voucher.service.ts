import { Injectable } from '@nestjs/common';
import { CreateVoucherCategoryDto } from './dto/voucher-category.dto';
import {
  CreateVoucherTagDto,
  UpdateVoucherTagDto,
} from './dto/voucher-tag.dto';
import {
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
  VoucherUsageDayRepository,
} from 'src/infrastructure/persistence/voucher/voucher.repository';
import { UUIDService } from '@utils/services/uuid.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { CreateVoucherDto } from './dto/vouchers/create-voucher.dto';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { NullAble } from '@utils/types/common.type';
import { UpdateVoucherDto } from './dto/vouchers/update-voucher.dto';
import {
  AddVoucherImgDto,
  UpdateVoucherImgDto,
} from './dto/voucher-img/voucher-img.dto';
import {
  VoucherPromotionCreateInput,
  VoucherPromotionDomain,
} from './domain/voucher-promotion.domain';
import { CreateVoucherPromotionDto } from './dto/voucher-promotion/create-promotion.dto';
import { UpdateVoucherPromotionDto } from './dto/voucher-promotion/update-promotion.dto';
import { isUUID } from 'class-validator';
import { UpdateVoucherUsageDayDto } from './dto/voucher-usage-day.dto';
import { VoucherUsageDaysDomain } from './domain/voucher-usage-day.domain';

@Injectable()
export class VoucherService {
  constructor(
    private voucherRepository: VoucherRepository,
    private voucherTagRepository: VoucherTagRepository,
    private voucherCategoryRepository: VoucherCategoryRepository,
    private voucherImgRepository: VoucherImgRepository,
    private voucherPromotionRepository: VoucherPromotionRepository,
    private voucherUsageDayRepository: VoucherUsageDayRepository,
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
    // ---------------------------------------------------------
    // ------------------ CREATE VOUCHER PART  ------------------
    //---------------------------------------------------------
    //---------------------------------------------------------
    const allImgBuffer = [];
    if (mainImg) allImgBuffer.push(...mainImg);
    if (voucherImg && voucherImg.length > 0) allImgBuffer.push(...voucherImg);
    // Firstly we need to upload the img to s3 and get the link back.
    const allVoucherImgLinks = await Promise.all(
      allImgBuffer.map((item) =>
        this.mediaService.uploadFile(
          item as Express.Multer.File,
          s3BucketDirectory.voucherImg,
        ),
      ),
    );
    // ------- SECOND PART : SET UP INFORMATION -------

    // Extract the term and condition from data
    const { termAndCondTh, termAndCondEn, promotion, ...restData } = data;

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
    if (promotion) {
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
  }: {
    tag?: VoucherTagDomain['name'];
    category?: VoucherCategoryDomain['name'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    sortOption?: unknown;
  }): Promise<VoucherDomain[]> {
    if (cursor && !isUUID(cursor, 7))
      throw ErrorApiResponse.conflictRequest(
        `${cursor} is not valid data type for cursor.`,
      );
    return this.voucherRepository.findMany({
      tag,
      category,
      cursor,
      paginationOption,
      sortOption,
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
  ): Promise<NullAble<VoucherDomain[]>> {
    return this.voucherRepository.findBySearchContent(searchContent);
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
    // If updated data contain
    // the new updated voucher code,
    // have to check first
    // does the new code already exist?
    return this.voucherRepository.update(data);
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
    mainImg,
    voucherImg,
  }: {
    data?: AddVoucherImgDto;
    mainImg?: Express.Multer.File;
    voucherImg?: Express.Multer.File[];
  }): Promise<void> {
    const voucher = await this.voucherRepository.findById(data.voucherId);
    if (!voucher)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher ID: ${data.voucherId} could not be found on this server.`,
      );
    if (mainImg) {
      const voucherMainImg = voucher.img.filter((item) => item.mainImg)[0];
      const toReplacedVoucherImgDomain = {
        id: voucherMainImg.id,
        imgPath: voucherMainImg.imgPath,
        mainImg: voucherMainImg.mainImg,
      };
      await this.updateVoucherMainImage({
        voucherId: voucher.id,
        toReplacedVoucherImgDomain,
        mainImg,
        deleteMainImg: data.deleteMainImg,
      });
    }
    if (voucherImg) {
      await this.createManyVoucherImg(voucher.id, voucherImg);
    }
    return;
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
    const voucherImg = await this.voucherImgRepository.findById(data.voucherId);
    if (!voucherImg)
      throw ErrorApiResponse.notFoundRequest(
        `Voucher image ID: ${data.voucherImgId} could not be found on this server.`,
      );
    const imageLink = await this.mediaService.uploadFile(
      file,
      s3BucketDirectory.voucherImg,
    );
    const updatedVoucherImg = await this.voucherImgRepository.updateVoucherImg(
      data.voucherImgId,
      { imgPath: imageLink },
    );
    await this.mediaService.deleteFile(voucherImg.imgPath);
    return updatedVoucherImg;
  }

  /**
   *
   * @param voucherId
   * @param toReplacedVoucherImgDomain
   * @param mainImg
   * @param boolean
   * @returns VoucherImgDomain
   */
  private async updateVoucherMainImage({
    voucherId,
    toReplacedVoucherImgDomain,
    mainImg,
    deleteMainImg = false,
  }: {
    voucherId: VoucherDomain['id'];
    toReplacedVoucherImgDomain: Pick<
      VoucherImgDomain,
      'id' | 'imgPath' | 'mainImg'
    >;
    mainImg: Express.Multer.File;
    deleteMainImg?: boolean;
  }): Promise<VoucherImgDomain> {
    const mainImageLink = await this.mediaService.uploadFile(
      mainImg,
      s3BucketDirectory.voucherImg,
    );
    const mainImgToUpdate: VoucherImgCreateInput = {
      id: String(this.uuidService.make()),
      imgPath: mainImageLink,
      mainImg: true,
      voucherId: voucherId,
    };
    const voucherImg = await this.voucherImgRepository.updateNewMainImgVoucher({
      mainImgId: toReplacedVoucherImgDomain.id,
      data: mainImgToUpdate,
      deleteMainImg,
    });
    if (deleteMainImg) {
      await this.mediaService.deleteFile(toReplacedVoucherImgDomain.imgPath);
    }
    return voucherImg;
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
  ): Promise<void> {
    const voucherImgLink = await Promise.all(
      data.map((item) => {
        return this.mediaService.uploadFile(item, s3BucketDirectory.voucherImg);
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

    // If the request data want to change the promotion start selling date and stop selling date
    // should check together if start-selling is greater or not.
    // if greater, than it could not proceed any further.
    if (data.sellStartedAt && data.sellExpiredAt) {
      if (data.sellStartedAt > data.sellExpiredAt) {
        throw ErrorApiResponse.conflictRequest(
          `The updated promotion start-selling date :: ${data.sellStartedAt} should not be greater than the update promotion stop-selling date: ${data.sellExpiredAt}`,
        );
      }
    }

    if (data.sellExpiredAt) {
      if (data.sellExpiredAt < isVoucherPromotionExist.sellStartedAt) {
        throw ErrorApiResponse.conflictRequest(
          `The updated promotion stop-selling date :: ${data.sellExpiredAt} should not be earlier than the existing start date: ${isVoucherPromotionExist.sellStartedAt}`,
        );
      }
    }

    if (data.usableAt) {
      if (data.usableAt < isVoucherPromotionExist.sellStartedAt) {
        throw ErrorApiResponse.conflictRequest(
          `The updated voucher usable date :: ${data.usableAt} should not be earlier than the start selling date: ${isVoucherPromotionExist.sellStartedAt}`,
        );
      }
    }

    if (data.usableAt && data.usableExpiredAt) {
      if (data.usableAt > data.usableExpiredAt) {
        throw ErrorApiResponse.conflictRequest(
          `The voucher usable date :: ${data.usableAt} should not be greater than the usable expired date: ${data.usableExpiredAt}`,
        );
      }
    }

    if (data.usableExpiredAt) {
      if (data.usableExpiredAt < isVoucherPromotionExist.usableAt) {
        throw ErrorApiResponse.conflictRequest(
          `The new voucher usable expired date :: ${data.usableExpiredAt} should not be earlier than the existing usable date: ${isVoucherPromotionExist.usableAt}`,
        );
      }
    }
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

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER USAGE DAY PART ------------------- //
  // -------------------------------------------------------------------- //

  async getVoucherUsageDay(): Promise<VoucherUsageDaysDomain> {
    return this.voucherUsageDayRepository.findCurrent();
  }

  async updateVoucherUsageDay(
    data: UpdateVoucherUsageDayDto,
  ): Promise<VoucherUsageDaysDomain> {
    return this.voucherUsageDayRepository.update({
      ...data,
      id: String(this.uuidService.make()),
    });
  }
}
