import { HttpStatus } from '@nestjs/common';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { PackageVoucherDomain } from '../domain/package-voucher.domain';
import { ApiProperty } from '@nestjs/swagger';
import { AuthPath } from 'src/config/api-path';

export enum PackageSellDateQueryEnum {
  NOW = 'NOW',
  ALL = 'ALL',
  EXPIRED = 'EXPIRED',
}

export enum PackageStatusQueryEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ALL = 'ALL',
}

export enum PackageDiscountQueryEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  NONE = 'NONE',
  ALL = 'ALL',
}

export class GetPaginationPackageVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET :: /packages successfully.',
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
        id: '0194c25f-ff9a-7299-9239-e4b7a4998640',
        category: 'Yok chinese restaurant',
        description:
          'เนื้อหมาผัดเต้าหู้ กินกับซอสต้นตำรับจากกวางจง ถิ่นหม่าล่า',
        images: [
          {
            id: '0194c260-09da-7436-9f19-521baf2682a9',
            mainImg: true,
            imgPath:
              'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858836_cute-dog.jpg',
          },
        ],
        price: 300,
        tag: 'main courses',
        quotaAmount: 2,
        quotaVoucherId: '0194c0f3-9df9-7655-88df-04a8b7862d8a',
        sellExpiredAt: '2025-03-31T17:00:00.000Z',
        sellStartedAt: '2024-12-31T17:00:00.000Z',
        stockAmount: 100,
        title: 'จัดเต้าหุ้สอง แถม เบอร์เกอร์กับปลาทอด',
        usableAt: '2024-12-31T17:00:00.000Z',
        usableExpiredAt: '2025-01-31T17:00:00.000Z',
        createdAt: '2025-02-01T16:37:41.475Z',
        updatedAt: '2025-02-01T16:37:41.475Z',
      },
    ],
  })
  public data: PackageVoucherDomain[];
  public cursor: string;

  constructor(
    code: GetPaginationPackageVoucherResponse['HTTPStatusCode'],
    message: GetPaginationPackageVoucherResponse['message'],
    link: GetPaginationPackageVoucherResponse['links'],
    data: GetPaginationPackageVoucherResponse['data'],
    cursor: GetPaginationPackageVoucherResponse['cursor'],
  ) {
    super(code, message, link);
    this.data = data;
    this.cursor = cursor;
  }

  public static success(
    data: GetPaginationPackageVoucherResponse['data'],
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetPaginationPackageVoucherResponse {
    const responseMessage = message ?? `GET :: /packages successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    const nxtPageCursor = data.length > 0 ? data[data.length - 1].id : null;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetPaginationPackageVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
      nxtPageCursor,
    );
  }
}

export class GetPackageVoucherByIdResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'GET :: /packages/123 successfully.',
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
      id: '0194c577-4593-75ce-81dc-c6aac1cb9c48',
      category: 'Yok chinese restaurant',
      description: 'เนื้อหมาผัดเต้าหู้ กินกับซอสต้นตำรับจากกวางจง ถิ่นหม่าล่า',
      images: [
        {
          id: '0194c577-472e-7729-aaed-4efc601d3c48',
          mainImg: true,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738479715716_cute-dog.jpg',
        },
      ],
      price: 300,
      discount: {
        discountedPrice: 199,
        status: 'ACTIVE',
      },
      tag: 'main courses',
      quotaAmount: 2,
      quotaVoucherId: '0194c0f3-9df9-7655-88df-04a8b7862d8a',
      sellExpiredAt: '2025-03-31T17:00:00.000Z',
      sellStartedAt: '2024-12-31T17:00:00.000Z',
      stockAmount: 100,
      title: 'จัดเต้าหุ้สอง แถม เบอร์เกอร์กับปลาทอด',
      termAndCondition: 'แซ่บลำแซ่บลำ',
      usableAt: '2024-12-31T17:00:00.000Z',
      usableExpiredAt: '2025-01-31T17:00:00.000Z',
      createdAt: '2025-02-02T07:01:56.158Z',
      updatedAt: '2025-02-02T07:01:56.158Z',
      rewardVouchers: [
        {
          id: '0194c577-4593-75ce-81dc-c9c2b960e126',
          voucherId: '0194c0f3-9df9-7655-88de-de9336454b71',
          amount: 1,
          img: null,
        },
        {
          id: '0194c577-4593-75ce-81dc-ce0cc81a281a',
          voucherId: '0194c0f3-9df9-7655-88de-e2da06950b7d',
          amount: 1,
          img: null,
        },
      ],
    },
  })
  public data: PackageVoucherDomain;

  public static success(
    data: PackageVoucherDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): GetPackageVoucherByIdResponse {
    const responseMessage =
      message ?? `GET :: /packages${data?.id ?? ''} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new GetPackageVoucherByIdResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
