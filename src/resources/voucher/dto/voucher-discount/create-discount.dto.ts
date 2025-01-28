import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherDiscountDomain } from '@resources/voucher/domain/voucher-discount.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsPositive, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class CreateVoucherDiscountDto {
  id?: VoucherDiscountDomain['id'];
  @IsUUID(7)
  @ApiProperty({ type: String })
  voucherId: VoucherDomain['id'];
  @ApiProperty({ type: Number })
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  discountedPrice: number;
}

export class CreateVoucherDiscountResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example:
      'Discount for Voucher ID: 123 have been created successfully. Currently discounted price is 199.',
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
  public data: VoucherDomain;

  constructor(
    code: CreateVoucherDiscountResponse['HTTPStatusCode'],
    message: CreateVoucherDiscountResponse['message'],
    links: CreateVoucherDiscountResponse['links'],
    data: CreateVoucherDiscountResponse['data'],
  ) {
    super(code, message, links);
    this.data = data;
  }

  public static success(
    data: VoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): CreateVoucherDiscountResponse {
    const responseMessage =
      message ??
      `Discount for Voucher ID: ${data.id} have been created successfully. Currently discounted price is ${data.discount?.discountedPrice}.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new CreateVoucherDiscountResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
