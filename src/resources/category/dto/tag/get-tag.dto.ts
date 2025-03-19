import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
import { IPaginationOption } from 'src/common/types/pagination.type';
import { AuthPath, CATEGORIES_CONST, CategoryPath } from 'src/config/api-path';

export class GetManyVoucherTagResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: `${HTTPMethod.Get} ${CategoryPath.GetManyTag} successfully.`,
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
  public data: VoucherTagDomain[];

  @ApiProperty({
    type: Object,
    example: 'sdfsdf',
  })
  public cursor: string;

  public page: IPaginationOption['page'];

  constructor(
    code: GetManyVoucherTagResponse['HTTPStatusCode'],
    message: GetManyVoucherTagResponse['message'],
    links: GetManyVoucherTagResponse['links'],
    data: GetManyVoucherTagResponse['data'],
    cursor: GetManyVoucherTagResponse['cursor'],
    page: GetManyVoucherTagResponse['page'],
  ) {
    super(code, message, links);
    this.data = data;
    this.cursor = cursor;
    this.page = page;
  }

  public static success(
    data: GetManyVoucherTagResponse['data'],
    page: number,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetManyVoucherTagResponse {
    const responseMessage = `${HTTPMethod.Get} ${CategoryPath.Base}${CATEGORIES_CONST.TAG_NAME} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    const nxtPageCursor = data.length > 0 ? data[data.length - 1].id : null;
    return new GetManyVoucherTagResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
      nxtPageCursor,
      page,
    );
  }
}
