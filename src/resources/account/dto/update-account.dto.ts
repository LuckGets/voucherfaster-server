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
  @IsPasswordValid()
  @IsOptional()
  password?: NullAble<string>;
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  fullname?: NullAble<string>;
  @ApiProperty({ type: () => Date, required: false })
  @IsEmail()
  @IsOptional()
  verifiedAt?: NullAble<Date>;
  @IsUrl()
  @IsString()
  @IsOptional()
  photo?: string;
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
    example: 'sdfsdf',
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
