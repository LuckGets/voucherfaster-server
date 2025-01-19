import { CoreApiResponse } from 'src/common/core-api-response';
import { UsableDaysAfterPurchasedDomain } from '../domain/usable-day.domain';
import { HATEOSLink } from 'src/common/hateos.type';
import { ApiProperty } from '@nestjs/swagger';
import { AuthPath, UsableDaysPath } from 'src/config/api-path';
import { HttpStatus } from '@nestjs/common';
import { HTTPMethod } from 'src/common/http.type';

export class GetUsableDaysAfterPurchasedResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET /usabledays successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: `{
        "id": "01947d72-d749-775b-b3e1-a165a524a2ad",
        "usableDays": 3,
        "createdAt": "1/19/2025, 2:24:29 PM",
        "updatedAt": "1/19/2025, 2:24:29 PM",
        "deletedAt": null
    }`,
  })
  public data: UsableDaysAfterPurchasedDomain;

  public static success(
    data: UsableDaysAfterPurchasedDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetUsableDaysAfterPurchasedResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Get} ${UsableDaysPath.Base} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetUsableDaysAfterPurchasedResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
