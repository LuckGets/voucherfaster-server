import { HttpStatus } from '@nestjs/common';
import { CoreApiResponse } from 'src/common/core-api-response';
import { OrderDomain } from '../domain/order.domain';
import { HATEOSLink } from 'src/common/hateos.type';
import { ApiProperty } from '@nestjs/swagger';
import { AuthPath } from 'src/config/api-path';
import { AccountDomain } from '@resources/account/domain/account.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import {
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsEnumValue } from '@utils/validators/IsEnum';
import { ProductTypeEnum } from 'src/common/types/product.type';

export class CreateOrderItem {
  @ApiProperty({
    type: String,
    description: 'ID of the purchased item.',
  })
  @IsUUID(7)
  id: VoucherDomain['id'] | PackageVoucherDomain['id'];
  @ApiProperty({
    type: () => String,
    enum: ProductTypeEnum,
    description:
      'There is two type of voucher. "voucher", "package". Please provide only three of these enum.',
  })
  @IsEnumValue(ProductTypeEnum, {
    message: `Voucher type should be provided with only one of this options. 1).${ProductTypeEnum.VOUCHER} 2).${ProductTypeEnum.PACKAGE} `,
  })
  type: ProductTypeEnum;
  @ApiProperty({
    type: Number,
    description: 'Quantity of the purchased item',
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  amount: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: Number,
    description: 'Calculated total price of all purchased item.',
  })
  @IsPositive()
  totalPrice: number;
  @ApiProperty({
    type: () => [CreateOrderItem],
    description:
      'Item information. Provide as an array of object. Please provide at least one item.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItem)
  items: CreateOrderItem[];
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
    example: `{
        "id": "019488cd-a13d-764f-be0d-080d4072aac5",
        "totalPrice": 300,
        "createdAt": "1/21/2025, 7:19:25 PM",
        "usableDay": "2025-01-23T17:00:00.000Z",
        "transaction": {
            "id": "019488cd-a14b-7e13-9146-3bcbfdaef644",
            "status": "PENDING",
            "transactionSystem": "omise",
            "createdAt": "1/21/2025, 7:19:25 PM",
            "updatedAt": "1/21/2025, 7:19:25 PM",
            "deletedAt": null
        }
    }`,
  })
  public data: OrderDomain;

  constructor(
    code: CreateOrderResponse['HTTPStatusCode'],
    message: CreateOrderResponse['message'],
    links: CreateOrderResponse['links'],
    data: OrderDomain,
  ) {
    super(code, message, links);
    this.data = data;
  }

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
