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
  VoucherStatusEnum,
  VoucherTagDomain,
  VoucherTermAndCondCreateInput,
} from './domain/voucher.domain';
import {
  VoucherCategoryRepository,
  VoucherRepository,
  VoucherTagRepository,
} from 'src/infrastructure/persistence/voucher/voucher.repository';
import { UUIDService } from '@utils/services/uuid.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { IPaginationOption } from 'src/common/types/pagination.type';

@Injectable()
export class VoucherService {
  constructor(
    private voucherRepository: VoucherRepository,
    private voucherTagRepository: VoucherTagRepository,
    private voucherCategoryRepository: VoucherCategoryRepository,
    private uuidService: UUIDService,
    private mediaService: MediaService,
  ) {}

  // ------------------------- VOUCHER PART -------------------------

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

    console.log('Check voucher code');
    const isVoucherCodeExists = await this.voucherRepository.findByVoucherCode(
      data.code,
    );
    if (isVoucherCodeExists)
      throw ErrorApiResponse.conflictRequest(
        `The voucher code ${data.code} has already exist. Please try again with new code.`,
      );
    console.log('After checking voucher code');
    // ---------------------------------------------------------
    // ------------------ CREATE VOUCHER PART  ------------------
    //---------------------------------------------------------
    //---------------------------------------------------------

    // Firstly we need to upload the img to s3 and get the link back.
    const allVoucherImgLinks = await Promise.all(
      [...mainImg, ...voucherImg].map((item) =>
        this.mediaService.uploadFile(
          item as Express.Multer.File,
          s3BucketDirectory.voucherImg,
        ),
      ),
    );
    // ------- SECOND PART : SET UP INFORMATION -------

    // Extract the term and condition from data
    const { termAndCondTh, termAndCondEn, ...restData } = data;

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

    console.log('Voucher Data before pass to repo', voucherData);
    // ------- THIRD PART : CREATE VOUCHER  -------
    return this.voucherRepository.createVoucherAndTermAndImgTransaction({
      voucherData,
      termAndCondThArr: termAndCondThWithVoucherId,
      termAndCondEnArr: termAndCondEnWithVoucherId,
      image: voucherImgToStore,
    });
  }

  public async getVoucher({
    tag,
    category,
    cursor,
    paginationOption,
    sortOption,
  }: {
    tag?: VoucherTagDomain['id'];
    category?: VoucherCategoryDomain['name'];
    paginationOption?: IPaginationOption;
    cursor?: VoucherDomain['id'];
    sortOption?: unknown;
  }) {
    return this.voucherRepository.findMany({
      tag,
      category,
      cursor,
      paginationOption,
      sortOption,
    });
  }

  // ------------------------- VOUCHER TAG PART -------------------------
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

  public async getVoucherTag() {}

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
  /**
   *
   * --- VOUCHER ---
   * --- CATEGORY ---
   * --- PART ---
   *
   */
  //---------------------

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
   * Find voucher category
   * via pagination by
   * cursor and page
   */
  public getPaginationVoucherCategory() {
    return this.voucherCategoryRepository.findManyWithPagination();
  }
}
