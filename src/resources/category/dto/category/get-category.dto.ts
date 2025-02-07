import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { IPaginationOption } from 'src/common/types/pagination.type';
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
    example: [
      {
        id: '0194b6e4-49d2-7141-8f77-7e06138207fc',
        name: 'All-international',
        createdAt: '2025-01-30T11:06:44.308Z',
        updatedAt: '2025-01-30T11:06:44.308Z',
        deletedAt: null,
        VoucherTags: [
          {
            id: '0194b6e4-49d3-7399-b682-898de4627fef',
            name: 'Breakfast',
            categoryId: '0194b6e4-49d2-7141-8f77-7e06138207fc',
            createdAt: '2025-01-30T11:06:44.436Z',
            updatedAt: '2025-01-30T11:06:44.436Z',
            deletedAt: null,
          },
          {
            id: '0194b6e4-49d3-7399-b682-8cde0e8bb8cb',
            name: 'Lunch',
            categoryId: '0194b6e4-49d2-7141-8f77-7e06138207fc',
            createdAt: '2025-01-30T11:06:44.436Z',
            updatedAt: '2025-01-30T11:06:44.436Z',
            deletedAt: null,
          },
          {
            id: '0194b6e4-49d3-7399-b682-90f35d1a1513',
            name: 'Dinner',
            categoryId: '0194b6e4-49d2-7141-8f77-7e06138207fc',
            createdAt: '2025-01-30T11:06:44.436Z',
            updatedAt: '2025-01-30T11:06:44.436Z',
            deletedAt: null,
          },
        ],
      },
    ],
  })
  public data: CategoryDomain[];
  @ApiProperty({
    type: String,
    example: `0194b6e4-49d2-7141-8f77-7e06138207fc`,
  })
  public cursor: string;

  @ApiProperty({
    type: Number,
    example: `1`,
  })
  public page: IPaginationOption['page'];

  constructor(
    code: GetManyCategoryResponse['HTTPStatusCode'],
    message: GetManyCategoryResponse['message'],
    link: GetManyCategoryResponse['links'],
    data: GetManyCategoryResponse['data'],
    cursor: GetManyCategoryResponse['cursor'],
    page: GetManyCategoryResponse['page'],
  ) {
    super(code, message, link);
    this.data = data;
    this.cursor = cursor;
    this.page = page;
  }

  public static success(
    data: CategoryDomain[],
    page: GetManyCategoryResponse['page'],
    link?: HATEOSLink,
    statusCode?: number,
  ): GetManyCategoryResponse {
    const responseMessage = `${HTTPMethod.Get} ${CategoryPath.Base} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const nxtPageCursor = data.length > 0 ? data[data.length - 1].id : null;
    return new GetManyCategoryResponse(
      responseCode,
      responseMessage,
      link,
      data,
      nxtPageCursor,
      page,
    );
  }
}

export class GetCategoryByIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET /categories/123 successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: [
      {
        id: '0194b6e4-49d2-7141-8f77-7e06138207fc',
        name: 'All-international',
        createdAt: '2025-01-30T11:06:44.308Z',
        updatedAt: '2025-01-30T11:06:44.308Z',
        deletedAt: null,
        VoucherTags: [
          {
            id: '0194b6e4-49d3-7399-b682-898de4627fef',
            name: 'Breakfast',
            categoryId: '0194b6e4-49d2-7141-8f77-7e06138207fc',
            createdAt: '2025-01-30T11:06:44.436Z',
            updatedAt: '2025-01-30T11:06:44.436Z',
            deletedAt: null,
          },
          {
            id: '0194b6e4-49d3-7399-b682-8cde0e8bb8cb',
            name: 'Lunch',
            categoryId: '0194b6e4-49d2-7141-8f77-7e06138207fc',
            createdAt: '2025-01-30T11:06:44.436Z',
            updatedAt: '2025-01-30T11:06:44.436Z',
            deletedAt: null,
          },
          {
            id: '0194b6e4-49d3-7399-b682-90f35d1a1513',
            name: 'Dinner',
            categoryId: '0194b6e4-49d2-7141-8f77-7e06138207fc',
            createdAt: '2025-01-30T11:06:44.436Z',
            updatedAt: '2025-01-30T11:06:44.436Z',
            deletedAt: null,
          },
        ],
      },
    ],
  })
  public data: CategoryDomain;

  constructor(
    code: GetCategoryByIdResponse['HTTPStatusCode'],
    message: GetCategoryByIdResponse['message'],
    link: GetCategoryByIdResponse['links'],
    data: GetCategoryByIdResponse['data'],
  ) {
    super(code, message, link);
    this.data = data;
  }

  public static success(
    data: CategoryDomain,
    message?: string,
    link?: HATEOSLink,
    statusCode?: number,
  ): GetCategoryByIdResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Get} ${CategoryPath.Base} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    return new GetCategoryByIdResponse(
      responseCode,
      responseMessage,
      link,
      data,
    );
  }
}
