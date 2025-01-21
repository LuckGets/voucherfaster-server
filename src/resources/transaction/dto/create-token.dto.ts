import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsPositive, IsString, Length, Max, Min } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class CreatePaymentTokenResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example:
      'Order ID: 123 for account ID: 321 have been created successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: 'tokn_test_62he5352gb2n5zhkjr8',
  })
  public data: string;

  public static success(
    data: string,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): CreatePaymentTokenResponse {
    const responseMessage = message ?? `Retrieve payment token successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new CreatePaymentTokenResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}

export class CreatePaymentTokenDto {
  @IsString()
  name: string;
  @IsString()
  number: string;
  @IsString()
  city: string;
  @IsString()
  postalCode: string;
  @IsPositive()
  @Max(12)
  @Min(1)
  @Transform(({ value }) => Number(value))
  expirationMonth: number;
  @IsPositive()
  @Min(new Date().getFullYear())
  @Transform(({ value }) => Number(value))
  expirationYear: number;
  @IsString()
  @Length(3, 3)
  securityCode: string;
}
