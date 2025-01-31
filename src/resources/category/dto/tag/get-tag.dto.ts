import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { HTTPMethod } from 'src/common/http.type';
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

  public cursor: string;

  constructor(
    code: GetManyVoucherTagResponse['HTTPStatusCode'],
    message: GetManyVoucherTagResponse['message'],
    links: GetManyVoucherTagResponse['links'],
    data: GetManyVoucherTagResponse['data'],
    cursor: string,
  ) {
    super(code, message, links);
    this.data = data;
    this.cursor = cursor;
  }

  public static success(
    data: GetManyVoucherTagResponse['data'],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetManyVoucherTagResponse {
    const responseMessage =
      message ??
      `${HTTPMethod.Get} ${CategoryPath.Base}${CATEGORIES_CONST.TAG_NAME} successfully.`;
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
    );
  }
}
