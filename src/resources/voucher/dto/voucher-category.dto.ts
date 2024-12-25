import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AuthPath, VoucherPath } from 'src/config/api-path';
import { VoucherCategoryDomain } from '../domain/voucher.domain';

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
    example: 'Account details for account id 123',
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
    data: T,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): VoucherCategoryResponse<T> {
    const responseMessage = message ?? 'Login Successfully';
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // GenerateAccountResponseHATEOASLink(
    //   data.id as UUIDTypes,
    //   !!data.verifiedAt,
    // );
    return new VoucherCategoryResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }

  public static createSuccess(
    data: VoucherCategoryDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): VoucherCategoryResponse<VoucherCategoryDomain> {
    const responseMessage = message ?? 'Create voucher category Successfully';
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    generateVoucherCategoryResponseHATEOASLink(data.id);
    return new VoucherCategoryResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}

const generateVoucherCategoryResponseHATEOASLink = (
  voucherCategoryId: string,
) => {
  return {
    category: {
      update: {
        method: HTTPMethod.Patch,
        path: `${VoucherPath.Category}/${voucherCategoryId}`,
      },
    },
    tags: {
      create: {
        method: HTTPMethod.Post,
        path: `${VoucherPath.Category}/${voucherCategoryId}/${VoucherPath.TagsName}`,
      },
      update: {
        method: HTTPMethod.Patch,
        path: `${VoucherPath.Category}/${voucherCategoryId}/${VoucherPath.TagsName}`,
      },
    },
  };
};
