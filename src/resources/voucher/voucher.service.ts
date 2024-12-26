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
  VoucherImgUpdateInput,
  VoucherStatusEnum,
  VoucherTagDomain,
  VoucherTermAndCondCreateInput,
} from './domain/voucher.domain';
import {
  VoucherCategoryRepository,
  VoucherImgRepository,
  VoucherRepository,
  VoucherTagRepository,
} from 'src/infrastructure/persistence/voucher/voucher.repository';
import { UUIDService } from '@utils/services/uuid.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { NullAble } from '@utils/types/common.type';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { UpdateVoucherImgDto } from './dto/voucher-img.dto';

@Injectable()
export class VoucherService {
  constructor(
    private voucherRepository: VoucherRepository,
    private voucherTagRepository: VoucherTagRepository,
    private voucherCategoryRepository: VoucherCategoryRepository,
    private voucherImgRepository: VoucherImgRepository,
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

    const isVoucherCodeExists = await this.voucherRepository.findByVoucherCode(
      data.code,
    );
    if (isVoucherCodeExists)
      throw ErrorApiResponse.conflictRequest(
        `The voucher code ${data.code} has already exist. Please try again with new code.`,
      );
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

    // ------- THIRD PART : CREATE VOUCHER  -------
    return this.voucherRepository.createVoucherAndTermAndImgTransaction({
      voucherData,
      termAndCondThArr: termAndCondThWithVoucherId,
      termAndCondEnArr: termAndCondEnWithVoucherId,
      image: voucherImgToStore,
    });
  }

  public async getPaginationVoucher({
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

  public async getVoucherById(
    id: VoucherDomain['id'],
  ): Promise<NullAble<VoucherDomain>> {
    const voucher = await this.voucherRepository.findById(id);
    if (!voucher)
      throw ErrorApiResponse.notFoundRequest(
        `The voucher ID: ${id} could not be found on this server.`,
      );
    return voucher;
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
    // changing the voucher code
    // have to check first
    // does the new code already exist?
    if (data.code) {
      const isVoucherCodeExists =
        await this.voucherRepository.findByVoucherCode(data.code);
      if (isVoucherCodeExists) {
        throw ErrorApiResponse.conflictRequest(
          `The voucher code: ${isVoucherCodeExists.code} already exists in this server. Please try again.`,
        );
      }
    }
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

  public async getPaginationVoucherTag() {}

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
    return this.voucherCategoryRepository.findManyWithPagination();
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
  private async getAllVoucherImgByVoucherId(
    id: VoucherDomain['id'],
  ): Promise<NullAble<VoucherImgDomain[]>> {
    return this.voucherImgRepository.findManyByVoucherId(id);
  }

  private async updateVoucherMainImage(
    voucherId: VoucherDomain['id'],
    oldVoucherMainImgId: VoucherImgDomain['id'],
    mainImg: Express.Multer.File,
  ): Promise<VoucherImgDomain> {
    const mainImageLink = await this.mediaService.uploadFile(
      mainImg[0],
      s3BucketDirectory.voucherImg,
    );
    const mainImgToUpdate: VoucherImgCreateInput = {
      id: String(this.uuidService.make()),
      imgPath: mainImageLink,
      mainImg: true,
      voucherId: voucherId,
    };
    return this.voucherImgRepository.updateNewMainImgVoucher(
      oldVoucherMainImgId,
      mainImgToUpdate,
    );
  }
  /**
   * Service for
   * update specific
   * voucher image
   * via ID
   */
  private async updateVoucherImg({}: {
    data: UpdateVoucherImgDto;
    mainImg: Express.Multer.File;
    voucherImg: Express.Multer.File[];
  }): Promise<VoucherImgDomain> {
    return;
  }
  /**
   * @param Express.Multer.File[]
   * @param voucherId
   * Service for
   * create new
   * voucher image
   */
  private async createVoucherImg(
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
}
