import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import {
  generateVoucherCategoryResponseHATEOASLink,
  generateVoucherTagResponseHATEOASLink,
} from 'src/common/HATEOASLinks';
import { CategoryDomain } from '@resources/category/domain/category.domain';

export class CreateCategoryDto {
  @ApiProperty({
    type: String,
    examples: ['Coffee Shop', 'Yok Chinese Restaurant'],
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateCategoryResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Create category name: ข้าวเหนียว successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: {
      id: '0194b796-e6f8-72b0-911c-df83f4786c0d',
      name: 'DOGGO',
      createdAt: '2025-01-30T14:21:47.643Z',
      updatedAt: '2025-01-30T14:21:47.643Z',
      deletedAt: null,
    },
  })
  public data: CategoryDomain;

  constructor(
    code: CreateCategoryResponse['HTTPStatusCode'],
    message: CreateCategoryResponse['message'],
    link: CreateCategoryResponse['links'],
    data: CreateCategoryResponse['data'],
  ) {
    super(code, message, link);
    this.data = data;
  }

  public static success(
    data: CreateCategoryResponse['data'],
    message?: string,
    link?: HATEOSLink,
    statusCode?: number,
  ): CreateCategoryResponse {
    const responseMessage =
      message ?? `Create category name ${data.name} successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    return new CreateCategoryResponse(
      responseCode,
      responseMessage,
      link,
      data,
    );
  }
}
