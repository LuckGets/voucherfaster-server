import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import {
  VoucherCategoryDomain,
  VoucherTagDomain,
} from '../domain/voucher.domain';
import {
  generateVoucherCategoryResponseHATEOASLink,
  generateVoucherTagResponseHATEOASLink,
} from 'src/common/HATEOASLinks';

export type VoucherCategoryResponseDataType = VoucherCategoryDomain & {
  links: HATEOSLink;
};

export class CreateVoucherCategoryDto {
  @ApiProperty({
    type: String,
    examples: ['Coffee Shop', 'Yok Chinese Restaurant'],
  })
  @IsString()
  name: string;
}

export class VoucherCategoryResponse<T> extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Get all voucher category response',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: 'sdfsdf',
  })
  public data: T;

  public static success<T>(
    data: unknown,
    message?: string,
    link?: HATEOSLink,
    statusCode?: number,
  ): VoucherCategoryResponse<T> {
    const responseMessage = message ?? 'Get voucher category Successfully';
    const responseCode = statusCode ?? HttpStatus.OK;
    return new VoucherCategoryResponse(
      responseCode,
      responseMessage,
      link,
      data,
    );
  }

  public static findManySuccess(
    data: VoucherCategoryDomain[],
    message?: string,
    link?: HATEOSLink,
    statusCode?: number,
  ) {
    const responseMessage = message ?? 'Get voucher category Successfully';
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseDataWithLinks = data.map((item) => {
      item.voucherTags.forEach(
        (voucherTag) =>
          (voucherTag['links'] = generateVoucherTagResponseHATEOASLink(
            item.id,
            voucherTag.id,
          )),
      );
      item['links'] = generateVoucherCategoryResponseHATEOASLink(item.id);
      return item;
    });
    return new VoucherCategoryResponse(
      responseCode,
      responseMessage,
      link,
      responseDataWithLinks,
    );
  }

  public static createSuccess(
    data: VoucherCategoryDomain,
    message?: string,
    statusCode?: number,
  ): VoucherCategoryResponse<VoucherCategoryDomain> {
    const responseMessage = message ?? 'Create voucher category Successfully';
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = generateVoucherCategoryResponseHATEOASLink(data.id);
    return new VoucherCategoryResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
