import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  VoucherDiscountDomain,
  VoucherDiscountStatusEnum,
} from '@resources/voucher/domain/voucher-discount.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { AtLeastOneProperty } from '@utils/validators/AtleastOneProp';
import { IsEnumValue } from '@utils/validators/IsEnum';
import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

@AtLeastOneProperty(UpdateVoucherDiscountDto.updatAbleFields())
export class UpdateVoucherDiscountDto {
  @IsUUID(7)
  @ApiProperty({ type: String })
  voucherId: VoucherDomain['id'];
  @ApiProperty({ type: Number })
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  discountedPrice?: VoucherDiscountDomain['discountedPrice'];
  @ApiProperty({ type: () => VoucherDiscountStatusEnum })
  @IsOptional()
  @IsEnumValue(VoucherDiscountStatusEnum)
  status?: VoucherDiscountStatusEnum;

  public static updatAbleFields(): Array<keyof UpdateVoucherDiscountDto> {
    return ['discountedPrice', 'status'];
  }
}

export class UpdateVoucherDiscountResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Discount for voucher ID: 456 have been updated successfully.',
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
    code: UpdateVoucherDiscountResponse['HTTPStatusCode'],
    message: UpdateVoucherDiscountResponse['message'],
    links: UpdateVoucherDiscountResponse['links'],
    data: UpdateVoucherDiscountResponse['data'],
  ) {
    super(code, message, links);
    this.data = data;
  }

  public static success(
    data: VoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherDiscountResponse {
    const responseMessage =
      message ??
      `Discount for voucher ID: ${data.id} have been updated successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new UpdateVoucherDiscountResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
