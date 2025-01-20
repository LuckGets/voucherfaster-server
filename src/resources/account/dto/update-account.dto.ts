import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { NullAble } from '@utils/types/common.type';
import { IsPasswordValid } from '@utils/validators/PasswordFormat';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { GenerateAccountResponseHATEOASLink } from 'src/common/HATEOASLinks';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { AccountDomain } from '../domain/account.domain';
import { IsEmptyValue } from '@utils/validators/IsEmptyValue';

type UpdateAccountResponseType = AccountDomain;

export class UpdateAccountDto {
  @ApiProperty({ type: String, required: false })
  @IsEmail()
  @IsOptional()
  email?: NullAble<string>;
  @ApiProperty({ type: String, required: false })
  @IsPhoneNumber('TH', {
    message: 'Phone number should be match with TH phone region code',
  })
  @IsOptional()
  phone?: NullAble<string>;
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  fullname?: NullAble<string>;
  @IsEmptyValue()
  password?: NullAble<string>;
  @IsEmptyValue()
  photo?: NullAble<string>;
  @IsEmptyValue()
  verifiedAt?: NullAble<Date>;
}

export class UpdateAccountResponse extends CoreApiResponse {
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
    example: `{
        "id": "019483f3-2100-750b-b39d-27e1c23d9933",
        "fullname": "JAJAJA JAJA",
        "phone": "0811234567",
        "email": "doggo@mail.com",
        "photo": "d22pq9rbvhh9yl.cloudfront.net/account-image/1737382129208_rocks.jpg",
        "accountProvider": "LOCAL",
        "createdAt": "1/20/2025, 8:42:16 PM",
        "updatedAt": "1/20/2025, 9:17:27 PM",
        "deletedAt": null,
        "verifiedAt": null
    }`,
  })
  public data: UpdateAccountResponseType;

  public static success(
    data: UpdateAccountResponseType,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateAccountResponse {
    const responseMessage =
      message ?? `Update AccountID : ${data.id} Successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink =
      links ??
      GenerateAccountResponseHATEOASLink(String(data.id), !!data.verifiedAt);
    return new UpdateAccountResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
