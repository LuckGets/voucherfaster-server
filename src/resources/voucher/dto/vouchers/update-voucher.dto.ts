import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';
import { VoucherDomain, VoucherStatusEnum } from '../../domain/voucher.domain';
import {
  IsDate,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsEnumValue } from '@utils/validators/IsEnum';
import { IsFutureDate } from '@utils/validators/IsFutureDate';
import { AtLeastOneProperty } from '@utils/validators/AtleastOneProp';
import {
  VoucherDiscountDomain,
  VoucherDiscountStatusEnum,
} from '@resources/voucher/domain/voucher-discount.domain';

@AtLeastOneProperty(UpdateVoucherDiscountDto.updatAbleFields())
export class UpdateVoucherDiscountDto {
  newId?: VoucherDiscountDomain['id'];
  currentDiscountId: VoucherDiscountDomain['id'];
  @IsOptional()
  @IsEnumValue(VoucherDiscountStatusEnum)
  status?: VoucherDiscountStatusEnum;
  @ApiProperty({ type: Number, required: false })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  discountedPrice?: number;

  public static updatAbleFields(): Array<keyof UpdateVoucherDiscountDto> {
    return ['discountedPrice', 'status'];
  }
}

@AtLeastOneProperty(UpdateVoucherDto.updatAbleField())
export class UpdateVoucherDto {
  @ApiProperty({ type: String, required: true })
  @IsUUID(7)
  id: string;
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  title?: string;
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({ type: Number, required: false })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  price?: number;
  @ApiProperty({ type: Number, required: false })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  stockAmount?: number;
  @ApiProperty({ type: Date, required: false })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  usableAt?: Date;
  @ApiProperty({ type: Date, required: false })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  usableExpiredAt?: Date;
  @ApiProperty({ type: Date, required: false })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  sellStartedAt?: Date;
  @ApiProperty({ type: Date, required: false })
  @IsFutureDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  sellExpiredAt?: Date;
  @ApiProperty({ type: String, required: false, example: '' })
  @IsUUID(7)
  @IsOptional()
  tagId?: string;
  @ApiProperty({ type: () => String, required: false })
  @IsOptional()
  @IsString()
  termAndCond?: VoucherDomain['termAndCondition'];
  @ApiProperty({ type: String, enum: VoucherStatusEnum, required: false })
  @IsEnumValue(VoucherStatusEnum)
  @IsOptional()
  status?: VoucherStatusEnum;
  @ApiProperty({ type: () => UpdateVoucherDiscountDto, required: false })
  @ValidateNested({ each: true })
  @Type(() => UpdateVoucherDiscountDto)
  @IsOptional()
  discount?: UpdateVoucherDiscountDto;

  public static updatAbleField(): Array<keyof UpdateVoucherDto> {
    return [
      'title',
      'description',
      'price',
      'stockAmount',
      'usableAt',
      'usableExpiredAt',
      'sellStartedAt',
      'sellExpiredAt',
      'tagId',
      'termAndCond',
      'discount',
      'status',
    ];
  }
}

export class UpdateVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Voucher ID: 123 have been updated successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: {
      id: '0194c0f3-9df9-7655-88df-04a8b7862d8a',
      title: 'Mapo tofu',
      status: 'ACTIVE',
      stockAmount: 10000,
      description: 'Spicy and hot tofu.',
      price: 210,
      usableAt: '2024-12-31T17:00:00.000Z',
      usableExpiredAt: '2025-12-25T17:00:00.000Z',
      termAndCondition:
        '<h1>ใบอนุญาตไทย71 Premium Buffet Dinner 1+0 Free1:Coupon8/10</h1>\n    <p>Ref. 2FCHD No. 1/1</p>\n    <p>Order No. 2024082558649924</p>\n    <p><strong>Expiry Date. 30 Dec 24 - 23:59</strong></p>\n    <h2>ราคานี้รวมเครื่องดื่มประเภท น้ำอัดลม ชา กาแฟ รับประทานได้แบบไม่จำกัดเวลา ตั้งแต่เวลา 18:00 - 22:00 น.</h2>\n    <p>ห้องอาหารดีเอมเมอร์ลด์ ชั้น 1 โรงแรมดีเอมเมอร์ลด์ MRT สถานีห้วยขวาง ทางออก 3</p>\n    <p>หลังสั่งซื้อแล้ว ทางโรงแรมจะไม่รับเปลี่ยนหรือคืนสินค้าทุกกรณี</p>\n    <h3>เงื่อนไขการใช้บริการ E-Voucher ไทยเที่ยวไทย71</h3>\n    <ul>\n      <li>E-Voucher นี้สามารถใช้ได้ตั้งแต่วันที่ 26 สิงหาคม - 30 ธันวาคม 67 เท่านั้น!</li>\n      <li>E-Voucher ใช้ได้ที่ห้องอาหารดีเอมเมอร์ลด์ ชั้น 1 โรงแรมดีเอมเมอร์ลด์ (1 E-Voucher สำหรับ 1 ท่าน เท่านั้น!)</li>\n      <li>เมื่อลูกค้าได้รับ E-Voucher ผ่าน Line หรือ E-mail แล้ว สามารถจองล่วงหน้าอย่างน้อย 3 วัน เพื่อเข้าใช้บริการได้เลยค่ะ</li>\n    </ul>\n    <h3>วิธีใช้บริการ E-Voucher</h3>\n    <ul>\n      <li>เมื่อมาใช้บริการ ลูกค้าจะต้องแสดง E-Voucher ผ่าน Line หรือ E-mail เท่านั้น ณ ที่ห้องอาหารเพื่อเข้ารับบริการ</li>\n      <li>ไม่สามารถแคปหน้าจอหรือบอกเพียงรหัสได้</li>\n      <li>E-Voucher ใช้ได้เพียง 1 ครั้ง ไม่สามารถใช้ซ้ำได้</li>\n      <li>E-Voucher ไม่สามารถใช้ร่วมกับโปรโมชั่น และ/หรือส่วนลดอื่น ๆ ได้</li>\n      <li>เมื่อมีการสั่งซื้อสำเร็จแล้วจะไม่สามารถยกเลิกหรือคืนเงินได้ ทุกกรณี</li>\n      <li>โรงแรมฯ ไม่รับผิดชอบต่อการสูญหายหรือการขโมยบัตรรับประทานอาหาร และไม่สามารถเปลี่ยนทดแทนได้หากสูญหาย/ถูกขโมย/หมดอายุ</li>\n      <li>โรงแรมฯ ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>\n    </ul>',
      sellStartedAt: '2024-12-25T17:00:00.000Z',
      sellExpiredAt: '2025-12-25T17:00:00.000Z',
      img: [
        {
          id: '0194c0f3-9df9-7655-88df-338274fb08c7',
          imgPath:
            'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/กะเพาะปลาน้ำแดง.jpg',
          mainImg: true,
        },
      ],
      discount: {
        id: '0194c573-e95e-7249-8a92-3333ad3ad7e4',
        discountedPrice: 200,
        createdAt: '2025-02-02T06:58:15.524Z',
        updatedAt: '2025-02-02T06:58:15.524Z',
        status: 'ACTIVE',
      },
      category: 'Yok chinese restaurant',
      tag: 'main courses',
    },
  })
  public data: VoucherDomain;

  constructor(
    code: UpdateVoucherResponse['HTTPStatusCode'],
    message: UpdateVoucherResponse['message'],
    links: UpdateVoucherResponse['links'],
    data: UpdateVoucherResponse['data'],
  ) {
    super(code, message, links);
    this.data = data;
  }

  public static success(
    data: VoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherResponse {
    const responseMessage =
      message ?? `Voucher ID: ${data.id} have been updated successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASl(data.id);
    return new UpdateVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
