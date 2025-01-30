import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class UpdateCategoryDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  id: string;
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCategoryResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'PATCH category ID: 123 with name: ข้าวเหนียว successfully.',
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
      name: 'หอยทอด แม่กลอง',
      createdAt: '2025-01-30T14:21:47.643Z',
      updatedAt: '2025-01-30T14:26:07.277Z',
      deletedAt: null,
    },
  })
  public data: CategoryDomain;

  constructor(
    code: UpdateCategoryResponse['HTTPStatusCode'],
    message: UpdateCategoryResponse['message'],
    link: UpdateCategoryResponse['links'],
    data: UpdateCategoryResponse['data'],
  ) {
    super(code, message, link);
    this.data = data;
  }

  public static success(
    data: UpdateCategoryResponse['data'],
    message?: string,
    link?: HATEOSLink,
    statusCode?: number,
  ): UpdateCategoryResponse {
    const responseMessage =
      message ??
      `Update category ID: ${data.id} with name ${data.name} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    return new UpdateCategoryResponse(
      responseCode,
      responseMessage,
      link,
      data,
    );
  }
}
