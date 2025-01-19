import { HttpStatus } from '@nestjs/common';
import { CoreApiResponse } from 'src/common/core-api-response';
import { OrderDomain } from '../domain/order.domain';
import { HATEOSLink } from 'src/common/hateos.type';
import { ApiProperty } from '@nestjs/swagger';
import { AuthPath } from 'src/config/api-path';
import { AccountDomain } from '@resources/account/domain/account.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { IsNumber, IsPositive, IsUUID, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsEnumValue } from '@utils/validators/IsEnum';

enum VoucherType {
  Voucher = 'voucher',
  Promotion = 'promotion',
  Package = 'package',
}

export class CreateOrderItem {
  @ApiProperty({
    type: String,
    description: 'ID of the purchased item.',
  })
  @IsUUID(7)
  id:
    | VoucherDomain['id']
    | VoucherPromotionDomain['id']
    | PackageVoucherDomain['id'];
  @ApiProperty({
    type: () => String,
    description:
      'There is three type of voucher. "voucher", "promotion", "package". Please provide only three of these enum.',
  })
  @IsEnumValue(VoucherType, {
    message: `Voucher type should be provided with only three of this options. 1).${VoucherType.Voucher} 2).${VoucherType.Promotion} 3).${VoucherType.Package}`,
  })
  type: VoucherType;
  @ApiProperty({
    type: Number,
    description: 'Quantity of the purchased item. Provided in string.',
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  amount: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: Number,
    description:
      'Calculated total price of all purchased item. Provided in string.',
  })
  @IsPositive()
  totalPrice: number;
  @ApiProperty({
    type: () => [CreateOrderItem],
    description:
      'Calculated total price of all purchased item. Provided in string.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItem)
  items: CreateOrderItem[];
  // @ApiProperty({
  //   type: String,
  //   description: 'Card token from payment gateway.',
  // })
  // paymentToken: string;
}

export class CreateOrderResponse extends CoreApiResponse {
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
    example: 'sdfsdf',
  })
  public data: OrderDomain;

  public static success(
    data: OrderDomain,
    accountId?: AccountDomain['id'],
    links?: HATEOSLink,
    statusCode?: number,
  ): CreateOrderResponse {
    const responseMessage = `Order ID: ${data.id} for account ID: ${accountId} have been created successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new CreateOrderResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
