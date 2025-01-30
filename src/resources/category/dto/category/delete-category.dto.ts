import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AuthPath } from 'src/config/api-path';

export class DeleteCategoryResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.NO_CONTENT,
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
    example: null,
  })
  public data: null;

  constructor(
    code: DeleteCategoryResponse['HTTPStatusCode'],
    message: DeleteCategoryResponse['message'],
    link: DeleteCategoryResponse['links'],
    data: DeleteCategoryResponse['data'],
  ) {
    super(code, message, link);
    this.data = data;
  }

  public static success(
    id: CategoryDomain['id'],
    message?: string,
    link?: HATEOSLink,
    statusCode?: number,
  ): DeleteCategoryResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Delete} category ID: ${id} successfully.`;
    const responseCode = statusCode ?? HttpStatus.NO_CONTENT;
    return new DeleteCategoryResponse(
      responseCode,
      responseMessage,
      link,
      null,
    );
  }
}
