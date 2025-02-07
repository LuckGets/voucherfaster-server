import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { accounts } from './account.seed';
import { voucherDiscounts, vouchers } from './voucher.seed';
import {
  packageQuotaVouchers,
  packageRewardVouchers,
  packageVoucherId,
} from './package.seed';
import { OrderItemDomain } from '../../src/resources/order-item/domain/order-item.domain';

export const orderIDArr = [
  '01948342-277a-77ae-bd3a-194f5752b687',
  '01948342-277a-77ae-bd3a-1ce08e83a92a',
  '01948342-277a-77ae-bd3a-211d190e8d42',
  '01948342-277a-77ae-bd3a-26f6dec77232',
  '01948342-277a-77ae-bd3a-2baec90ef53a',
];

export const orderItemIDArr = [
  '01948342-277f-7397-b211-5aa6faa5ff8a',
  '01948342-277f-7397-b211-5ff0bdb81905',
  '01948342-277f-7397-b211-62057afd4813',
  '01948342-277f-7397-b211-67b5fca53919',
  '01948342-277f-7397-b211-6b292bcbb8ec',
  '01948342-277f-7397-b211-6d5a2795a001',
  '01948342-277f-7397-b211-735e8b8ba6cc',
  '01948342-277f-7397-b211-74853371c868',
  '01948342-277f-7397-b211-789ae0812f6e',
];

const ordersMapping = {
  firstOrder: {
    id: orderIDArr[0],
    accountId: accounts[1].id,
    totalPrice: 300,
  },
  secondOrder: {
    id: orderIDArr[1],
    accountId: accounts[2].id,
    totalPrice: 300,
  },
  thirdOrder: {
    id: orderIDArr[2],
    accountId: accounts[3].id,
    totalPrice: 199,
  },
  fourthOrder: {
    id: orderIDArr[3],
    accountId: accounts[3].id,
    totalPrice: 1200,
  },
  fifthOrder: {
    id: orderIDArr[4],
    accountId: accounts[3].id,
    totalPrice: 498,
  },
};

export const orders: Prisma.OrderCreateManyInput[] = [
  {
    accountId: ordersMapping.firstOrder.accountId,
    totalPrice: ordersMapping.firstOrder.totalPrice,
    id: ordersMapping.firstOrder.id,
  },
  {
    accountId: ordersMapping.secondOrder.accountId,
    totalPrice: ordersMapping.secondOrder.totalPrice,
    id: ordersMapping.secondOrder.id,
  },
  {
    accountId: ordersMapping.thirdOrder.accountId,
    totalPrice: ordersMapping.thirdOrder.totalPrice,
    id: ordersMapping.thirdOrder.id,
  },
  {
    accountId: ordersMapping.fourthOrder.accountId,
    totalPrice: ordersMapping.fourthOrder.totalPrice,
    id: ordersMapping.fourthOrder.id,
  },
  {
    accountId: ordersMapping.fifthOrder.accountId,
    totalPrice: ordersMapping.fifthOrder.totalPrice,
    id: ordersMapping.fifthOrder.id,
  },
];

export const orderItems: Prisma.OrderItemCreateManyInput[] = [
  {
    id: orderItemIDArr[0],
    code: 'AB2BCA',
    qrcodeImagePath: OrderItemDomain.defaultQrCodeImagePath(),
    orderId: orderIDArr[0],
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: orderItemIDArr[1],
    code: 'AB2BCB',
    qrcodeImagePath: OrderItemDomain.defaultQrCodeImagePath(),
    orderId: orderIDArr[1],
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    id: orderItemIDArr[2],
    code: 'AB2BCC',
    qrcodeImagePath: OrderItemDomain.defaultQrCodeImagePath(),
    orderId: orderIDArr[1],
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    id: orderItemIDArr[3],
    code: 'AB2BCD',
    qrcodeImagePath: OrderItemDomain.defaultQrCodeImagePath(),
    orderId: orderIDArr[2],
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    id: orderItemIDArr[4],
    code: 'AB2BCE',
    qrcodeImagePath: OrderItemDomain.defaultQrCodeImagePath(),
    orderId: orderIDArr[3],
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    id: orderItemIDArr[5],
    code: 'AB2BCF',
    qrcodeImagePath: OrderItemDomain.defaultQrCodeImagePath(),
    orderId: orderIDArr[3],
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    id: orderItemIDArr[6],
    code: 'AB2BCG',
    qrcodeImagePath: OrderItemDomain.defaultQrCodeImagePath(),
    orderId: orderIDArr[3],
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    id: orderItemIDArr[7],
    code: 'AB2BCH',
    qrcodeImagePath: OrderItemDomain.defaultQrCodeImagePath(),
    orderId: orderIDArr[4],
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    id: orderItemIDArr[8],
    code: 'AB2BCI',
    qrcodeImagePath: OrderItemDomain.defaultQrCodeImagePath(),
    orderId: orderIDArr[4],
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
];

export const orderItemsPackageQuotas: Prisma.OrderItemPackageQuotaCreateManyInput[] =
  [
    {
      id: uuidv7(),
      orderItemId: orderItemIDArr[1],
      packageId: packageVoucherId[0],
      packageQuotaVoucherId: packageQuotaVouchers[0].id,
    },
    {
      id: uuidv7(),
      orderItemId: orderItemIDArr[4],
      packageId: packageVoucherId[1],
      packageQuotaVoucherId: packageQuotaVouchers[1].id,
    },
    {
      id: uuidv7(),
      orderItemId: orderItemIDArr[5],
      packageId: packageVoucherId[1],
      packageQuotaVoucherId: packageQuotaVouchers[1].id,
    },
    {
      id: uuidv7(),
      orderItemId: orderItemIDArr[7],
      packageId: packageVoucherId[0],
      packageQuotaVoucherId: packageQuotaVouchers[0].id,
    },
  ];

export const orderItemPackageRewards: Prisma.OrderItemPackageRewardCreateManyInput[] =
  [
    {
      id: uuidv7(),
      orderItemId: orderItemIDArr[2],
      packageId: packageVoucherId[0],
      packageRewardVoucherId: packageRewardVouchers[0].id,
    },
    {
      id: uuidv7(),
      orderItemId: orderItemIDArr[6],
      packageId: packageVoucherId[0],
      packageRewardVoucherId: packageRewardVouchers[1].id,
    },
    {
      id: uuidv7(),
      orderItemId: orderItemIDArr[8],
      packageId: packageVoucherId[0],
      packageRewardVoucherId: packageRewardVouchers[1].id,
    },
  ];

export const orderItemsVouher: Prisma.OrderItemVoucherCreateManyInput[] = [
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[0],
    voucherId: vouchers[0].id,
    voucherDiscountId: voucherDiscounts[0].id,
  },
];
