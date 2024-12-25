import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '@utils/validators/Match';
import { NotMatch } from '@utils/validators/NotMatch';
import { Length } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { AccountDomain } from '../domain/account.domain';
import { IsPasswordValid } from '@utils/validators/PasswordFormat';
import { GenerateAccountResponseHATEOASLink } from 'src/common/HATEOASLinks';

type ChangePasswordResponseDataType = {
  id: AccountDomain['id'];
  verifiedAt: AccountDomain['verifiedAt'];
};

export class ChangePasswordDto {
  @ApiProperty({ type: String, example: 'Qwerty', minLength: 6, maxLength: 20 })
  @Length(6, 20)
  @NotMatch('newPassword')
  @IsPasswordValid()
  oldPassword: string;

  @ApiProperty({ type: String, example: 'Qwerty', minLength: 6, maxLength: 20 })
  @Length(6, 20)
  @IsPasswordValid()
  newPassword: string;

  @ApiProperty({ type: String, example: 'Qwerty', minLength: 6, maxLength: 20 })
  @Length(6, 20)
  @Match('newPassword')
  @IsPasswordValid()
  confirmNewPassword: string;
}

export class ConfirmChangePasswordDto {
  @Length(10, 20)
  token: string;
}

export class ChangePasswordResponse extends CoreApiResponse {
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
    example: '',
  })
  public data: null;

  public static success(
    data: ChangePasswordResponseDataType,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): ChangePasswordResponse {
    const responseMessage =
      message ?? 'Request for changing the password successful.';
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink =
      links ??
      GenerateAccountResponseHATEOASLink(data.id as string, !!data.verifiedAt);
    return new ChangePasswordResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
