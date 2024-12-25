import { Injectable } from '@nestjs/common';
import { CreateVoucherCategoryDto } from './dto/voucher-category.dto';
import { CreateVoucherTagDto } from './dto/voucher-tag.dto';
import {
  VoucherCategoryDomain,
  VoucherTagDomain,
} from './domain/voucher.domain';
import {
  VoucherCategoryRepository,
  // VoucherRepository,
  VoucherTagRepository,
} from 'src/infrastructure/persistence/voucher/voucher.repository';
import { UUIDService } from '@utils/services/uuid.service';
import { ErrorApiResponse } from 'src/common/core-api-response';
// import { CreateVoucherDto } from './dto/create-voucher.dto';
// import { MediaService } from '@application/media/media.service';

@Injectable()
export class VoucherService {
  constructor(
    // private voucherRepository: VoucherRepository,
    private voucherTagRepository: VoucherTagRepository,
    private voucherCategoryRepository: VoucherCategoryRepository,
    private uuidService: UUIDService,
    // private mediaService: MediaService,
  ) {}

  /**
   *
   * --- VOUCHER ---
   * --- PART ---
   *
   */
  public async createVoucher() {
    // voucherImg: Express.Multer.File[], // voucherMainImg: Express.Multer.File[], // data: CreateVoucherDto,
    // create voucher first
    // const voucherCreateInput = '';
    // const newVoucher = await this.voucherRepository;
    // add all term and condition
    // upload image to s3
    // collect image link in repository
  }

  /**
   *
   * --- VOUCHER ---
   * --- TAG ---
   * --- PART ---
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

  /**
   *
   * --- VOUCHER ---
   * --- CATEGORY ---
   * --- PART ---
   *
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
}
