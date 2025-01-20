import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { accounts } from './account.seed';
import { voucherPromotions, vouchers } from './voucher.seed';
import { packageVoucherId } from './package.seed';

export const usableDaysAfterPurchased: Prisma.UsableDaysAfterPurchasedCreateInput =
  {
    id: uuidv7(),
    usableDays: 3,
  };

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
    usableDaysAfterPurchasedId: usableDaysAfterPurchased.id,
    id: ordersMapping.firstOrder.id,
  },
  {
    accountId: ordersMapping.secondOrder.accountId,
    totalPrice: ordersMapping.secondOrder.totalPrice,
    usableDaysAfterPurchasedId: usableDaysAfterPurchased.id,
    id: ordersMapping.secondOrder.id,
  },
  {
    accountId: ordersMapping.thirdOrder.accountId,
    totalPrice: ordersMapping.thirdOrder.totalPrice,
    usableDaysAfterPurchasedId: usableDaysAfterPurchased.id,
    id: ordersMapping.thirdOrder.id,
  },
  {
    accountId: ordersMapping.fourthOrder.accountId,
    totalPrice: ordersMapping.fourthOrder.totalPrice,
    usableDaysAfterPurchasedId: usableDaysAfterPurchased.id,
    id: ordersMapping.fourthOrder.id,
  },
  {
    accountId: ordersMapping.fifthOrder.accountId,
    totalPrice: ordersMapping.fifthOrder.totalPrice,
    usableDaysAfterPurchasedId: usableDaysAfterPurchased.id,
    id: ordersMapping.fifthOrder.id,
  },
];

export const orderItems: Prisma.OrderItemCreateManyInput[] = [
  {
    id: orderItemIDArr[0],
    code: 'AB2BCA',
    qrcodeImgPath: 'fakePath',
    orderId: orderIDArr[0],
  },
  {
    id: orderItemIDArr[1],
    code: 'AB2BCB',
    qrcodeImgPath: 'fakePath',
    orderId: orderIDArr[1],
  },
  {
    id: orderItemIDArr[2],
    code: 'AB2BCC',
    qrcodeImgPath: 'fakePath',
    orderId: orderIDArr[1],
  },
  {
    id: orderItemIDArr[3],
    code: 'AB2BCD',
    qrcodeImgPath: 'fakePath',
    orderId: orderIDArr[2],
  },
  {
    id: orderItemIDArr[4],
    code: 'AB2BCE',
    qrcodeImgPath: 'fakePath',
    orderId: orderIDArr[3],
  },
  {
    id: orderItemIDArr[5],
    code: 'AB2BCF',
    qrcodeImgPath: 'fakePath',
    orderId: orderIDArr[3],
  },
  {
    id: orderItemIDArr[6],
    code: 'AB2BCG',
    qrcodeImgPath: 'fakePath',
    orderId: orderIDArr[3],
  },
  {
    id: orderItemIDArr[7],
    code: 'AB2BCH',
    qrcodeImgPath: 'fakePath',
    orderId: orderIDArr[4],
  },
  {
    id: orderItemIDArr[8],
    code: 'AB2BCI',
    qrcodeImgPath: 'fakePath',
    orderId: orderIDArr[4],
  },
];

export const orderItemsPromotion: Prisma.OrderItemPromotionCreateManyInput[] = [
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[3],
    voucherPromotionId: voucherPromotions[0].id,
  },
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[7],
    voucherPromotionId: voucherPromotions[1].id,
  },
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[8],
    voucherPromotionId: voucherPromotions[0].id,
  },
];

export const orderItemsPackage: Prisma.OrderItemPackageCreateManyInput[] = [
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[1],
    packageId: packageVoucherId[0],
    rewardVoucher: false,
    voucherId: vouchers[0].id,
  },
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[2],
    packageId: packageVoucherId[0],
    rewardVoucher: true,
    voucherId: vouchers[0].id,
  },
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[4],
    packageId: packageVoucherId[1],
    rewardVoucher: false,
    voucherId: vouchers[0].id,
  },
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[5],
    packageId: packageVoucherId[1],
    rewardVoucher: false,
    voucherId: vouchers[0].id,
  },
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[6],
    packageId: packageVoucherId[1],
    rewardVoucher: true,
    voucherId: vouchers[0].id,
  },
];

export const orderItemsVouher: Prisma.OrderItemVoucherCreateManyInput[] = [
  {
    id: uuidv7(),
    orderItemId: orderItemIDArr[0],
    voucherId: vouchers[0].id,
  },
];
