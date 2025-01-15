import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { vouchers } from './voucher.seed';

const packageVoucherId = Array(2)
  .fill('')
  .map(() => uuidv7());

export const packages: Prisma.PackageVoucherCreateManyInput[] = [
  {
    id: packageVoucherId[0],
    title: 'โปรโมชั่นแพ็คเกจ ซื้อ1แถม1',
    quotaVoucherId: vouchers[0].id,
    quotaAmount: 1,
    stockAmount: 100,
    packagePrice: 300,
    startedAt: '2024-12-31T17:00:00.000Z',
    expiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    id: packageVoucherId[1],
    title: 'เป็ดฮ่องกงแซ่บๆ 2 แถม 1',
    stockAmount: 100,
    quotaVoucherId: vouchers[5].id,
    quotaAmount: 2,
    packagePrice: 1200,
    startedAt: '2024-12-31T17:00:00.000Z',
    expiredAt: '2025-01-31T17:00:00.000Z',
  },
];

export const packageRewardVouchers: Prisma.PackageRewardVoucherCreateManyInput[] =
  [
    {
      id: uuidv7(),
      packageId: packages[0].id,
      rewardVoucherId: vouchers[0].id,
    },
    {
      id: uuidv7(),
      packageId: packages[1].id,
      rewardVoucherId: vouchers[5].id,
    },
    {
      id: uuidv7(),
      packageId: packages[1].id,
      rewardVoucherId: vouchers[5].id,
    },
    {
      id: uuidv7(),
      packageId: packages[1].id,
      rewardVoucherId: vouchers[5].id,
    },
  ];

export const packageImgs: Prisma.PackageImgCreateManyInput[] = [
  {
    id: uuidv7(),
    mainImg: true,
    imgPath:
      'd22pq9rbvhh9yl.cloudfront.net/package-img/1736355046659_voucher-template-with-offer_23-2148479796.avif',
    packageId: packages[0].id,
  },
  {
    id: uuidv7(),
    mainImg: true,
    imgPath: 'd22pq9rbvhh9yl.cloudfront.net/package-img/เป็ด.jpg',
    packageId: packages[0].id,
  },
];

export const packageTermAndCondTH: Prisma.PackageVoucherTermAndCondTHCreateManyInput[] =
  [
    {
      id: uuidv7(),
      description: 'คูปองนี้สามารถใช้ได้เฉพาะในวันเสาร์เท่านั้น',
      packageVoucherId: packages[0].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้สามารถใช้ได้เฉพาะกับจานเป็ดย่างเท่านั้น',
      packageVoucherId: packages[1].id,
    },
  ];

export const packageTermAndCondEN: Prisma.PackageVoucherTermAndCondENCreateManyInput[] =
  [
    {
      id: uuidv7(),
      description: 'This voucher can only be used on Saturday.',
      packageVoucherId: packages[0].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher can only be used on roasted duck dishes.',
      packageVoucherId: packages[1].id,
    },
  ];
