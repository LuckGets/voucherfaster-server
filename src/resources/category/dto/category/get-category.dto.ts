import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { AuthPath, CategoryPath } from 'src/config/api-path';

export class GetManyCategoryResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET /categories successfully.',
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
  public data: CategoryDomain[];
  public cursor: string;

  constructor(
    code: GetManyCategoryResponse['HTTPStatusCode'],
    message: GetManyCategoryResponse['message'],
    link: GetManyCategoryResponse['links'],
    data: GetManyCategoryResponse['data'],
    cursor: GetManyCategoryResponse['cursor'],
  ) {
    super(code, message, link);
    this.data = data;
    this.cursor = cursor;
  }

  public static success(
    data: CategoryDomain[],
    cursor: string,
    message?: string,
    link?: HATEOSLink,
    statusCode?: number,
  ): GetManyCategoryResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Get} ${CategoryPath.Base} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    return new GetManyCategoryResponse(
      responseCode,
      responseMessage,
      link,
      data,
      cursor,
    );
  }
}
