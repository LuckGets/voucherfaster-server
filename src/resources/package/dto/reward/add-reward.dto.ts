import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  PackageRewardVoucherDomain,
  PackageVoucherDomain,
} from '@resources/package/domain/package-voucher.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { IsPositive, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class AddNewPackageRewardVoucherDto {
  @ApiProperty({ type: String })
  @IsUUID(7)
  packageId: PackageVoucherDomain['id'];
  @ApiProperty({ type: String })
  @IsUUID(7)
  voucherId: PackageRewardVoucherDomain['voucherId'];
  @ApiProperty({ type: Number })
  @IsPositive()
  amount: PackageRewardVoucherDomain['amount'];
}

export class AddNewPackageRewardVoucherResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Package ID: 123 have been updated successfully.',
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
      id: '0194c25f-ff9a-7299-9239-e4b7a4998640',
      category: 'Yok chinese restaurant',
      description: 'เนื้อหมาผัดเต้าหู้ กินกับซอสต้นตำรับจากกวางจง ถิ่นหม่าล่า',
      images: [
        {
          id: '0194c260-09da-7436-9f19-521baf2682a9',
          mainImg: true,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858836_cute-dog.jpg',
        },
        {
          id: '0194c260-09da-7436-9f19-567a066c00d8',
          mainImg: false,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858830_voucher-redeeming-via-receptionist.png',
        },
        {
          id: '0194c260-09da-7436-9f19-5a4696367e6e',
          mainImg: false,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858837_email-items.jpg',
        },
        {
          id: '0194c260-09da-7436-9f19-5fb5d78fa325',
          mainImg: false,
          imgPath:
            'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858831_rocks.jpg',
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
      createdAt: '2025-02-01T16:37:41.475Z',
      updatedAt: '2025-02-01T16:37:41.475Z',
      rewardVouchers: [
        {
          id: '0194c25f-ff9a-7299-9239-e8c77de4f62f',
          voucherId: '0194c0f3-9df9-7655-88de-de9336454b71',
          amount: 1,
          img: 'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858837_email-items.jpg',
        },
        {
          id: '0194c25f-ff9a-7299-9239-ef2fd1638c42',
          voucherId: '0194c0f3-9df9-7655-88de-e2da06950b7d',
          amount: 1,
          img: 'd22pq9rbvhh9yl.cloudfront.net/package-img/1738427858831_rocks.jpg',
        },
      ],
    },
  })
  public data: PackageVoucherDomain;

  constructor(
    code: AddNewPackageRewardVoucherResponse['HTTPStatusCode'],
    message: AddNewPackageRewardVoucherResponse['message'],
    links: AddNewPackageRewardVoucherResponse['links'],
    data: PackageVoucherDomain,
  ) {
    super(code, message, links);
    this.data = data;
  }

  public static success(
    data: PackageVoucherDomain,
    addedVoucherId: VoucherDomain['id'],
    links?: HATEOSLink,
    statusCode?: number,
  ): AddNewPackageRewardVoucherResponse {
    const responseMessage = `Voucher ID: ${addedVoucherId} have been added as reward voucher to package ID: ${data.id} successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // generateVoucherReponseHATEOASLink(data.id);
    return new AddNewPackageRewardVoucherResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
