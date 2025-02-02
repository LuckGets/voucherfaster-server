import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath, VoucherPath } from 'src/config/api-path';
import { VoucherDomain } from '../../domain/voucher.domain';
import { HTTPMethod } from 'src/common/http.type';
import { NullAble } from '@utils/types/common.type';

export enum PaginationSellDateQueryEnum {
  NOW = 'NOW',
  EXPIRED = 'EXPIRED',
  ALL = 'ALL',
}

export enum PaginationDiscountQueryEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  NONE = 'NONE',
  ALL = 'ALL',
}

export enum PaginationStatusQueryEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ALL = 'ALL',
}

export class GetManyVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET:: /vouchers/123 successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: [
      {
        id: '0194b6e4-49d3-7399-b682-a2f68f72b9be',
        title: 'Burger with fries',
        status: 'ACTIVE',
        stockAmount: 10000,
        description: 'Juicy burgers with crispy french fries.',
        price: 300,
        usableAt: '2024-12-31T17:00:00.000Z',
        usableExpiredAt: '2025-12-25T17:00:00.000Z',
        sellStartedAt: '2024-12-25T17:00:00.000Z',
        sellExpiredAt: '2025-12-25T17:00:00.000Z',
        img: [
          {
            id: '0194b6e4-49d3-7399-b682-cc1e1db7b121',
            imgPath:
              'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp',
          },
        ],
        discount: {
          id: '0194b6e4-49d3-7399-b682-f939c52bdf91',
          discountedPrice: 199,
          createdAt: '2025-01-30T11:06:44.623Z',
          updatedAt: '2025-01-30T11:06:44.623Z',
          status: 'ACTIVE',
        },
        category: 'All-international',
        tag: 'Lunch',
      },
    ],
  })
  public data: VoucherDomain[];
  @ApiProperty({
    type: String,
    description:
      "The last data's ID using in the next query to retrive the next data pages.",
  })
  public cursor: VoucherDomain['id'];

  constructor(
    code: number,
    message: string,
    link: HATEOSLink,
    data: VoucherDomain[],
    cursor: VoucherDomain['id'],
  ) {
    super(code, message, link);

    this.data = data;
    this.cursor = cursor;
  }

  public static success(
    data: VoucherDomain[],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetManyVoucherResponse {
    const responseMessage =
      message ?? `${HTTPMethod.Get}:: ${VoucherPath.Base} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    const nxtPageCursor = data.length > 0 ? data[data.length - 1].id : null;

    return new GetManyVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
      nxtPageCursor,
    );
  }
}

export class GetVoucherBySearchContentResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET:: /vouchers/search/ข้าวเหนียว successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: [
      {
        id: '0194c0f3-9df9-7655-88df-04a8b7862d8a',
        title: 'Mapo tofu',
        status: 'ACTIVE',
        stockAmount: 10000,
        description: 'Spicy and hot tofu.',
        price: 210,
        usableAt: '2024-12-31T17:00:00.000Z',
        usableExpiredAt: '2025-12-25T17:00:00.000Z',
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
          id: '0194c0f3-9df9-7655-88df-419e75207a0f',
          discountedPrice: 599,
          createdAt: '2025-02-01T09:59:41.533Z',
          updatedAt: '2025-02-01T09:59:41.533Z',
          status: 'ACTIVE',
        },
        category: 'Yok chinese restaurant',
        tag: 'main courses',
      },
    ],
  })
  public data: NullAble<VoucherDomain[]>;
  @ApiProperty({
    type: String,
    example: `9HrBC1jMQ3KlZw4CssPUeQ`,
  })
  public cursor: NullAble<VoucherDomain['id']>;

  constructor(
    code: number,
    message: string,
    link: HATEOSLink,
    data: GetVoucherBySearchContentResponse['data'],
    cursor: GetVoucherBySearchContentResponse['cursor'],
  ) {
    super(code, message, link);

    this.data = data;
    this.cursor = cursor;
  }

  public static success(
    data: VoucherDomain[],
    searchContent: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetVoucherBySearchContentResponse {
    const responseMessage = `${HTTPMethod.Get} ${VoucherPath.Base}/${VoucherPath.SearchVoucher.split('/')[0]}/${searchContent} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    const nxtPageCursor = data.length > 0 ? data[data.length - 1].id : null;

    return new GetVoucherBySearchContentResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
      nxtPageCursor,
    );
  }
}

export class GetVoucherByIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET:: /vouchers/1  successfully.',
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
        id: '0194c0f3-9df9-7655-88df-419e75207a0f',
        discountedPrice: 599,
        createdAt: '2025-02-01T09:59:41.533Z',
        updatedAt: '2025-02-01T09:59:41.533Z',
        status: 'ACTIVE',
      },
      category: 'Yok chinese restaurant',
      tag: 'main courses',
    },
  })
  public data: NullAble<VoucherDomain>;

  constructor(
    code: number,
    message: string,
    link,
    data: GetVoucherByIdResponse['data'],
  ) {
    super(code, message, link);
    this.data = data;
  }

  public static success(
    data: VoucherDomain,
    paramId: VoucherDomain['id'],
    links?: HATEOSLink,
    statusCode?: number,
  ): GetVoucherByIdResponse {
    const responseMessage = `${HTTPMethod.Get} ${VoucherPath.Base}/${paramId} successful.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetVoucherByIdResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
