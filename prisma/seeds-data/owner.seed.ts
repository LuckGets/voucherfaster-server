import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

const ownerIdList = Array(2)
  .fill('')
  .map(() => uuidv7());

export const ownerInfo: Prisma.OwnerCreateManyInput[] = [
  {
    id: ownerIdList[0],
    name: 'The Emerald Hotel',
    emailForSendingVoucher: 'kasides12@gmail.com',
    passwordForEmail:
      '73dadc8007d15e276c843881:058174ce15683bede844aadc5aaa4f27:ade86142987f127430ded9f609665ffaa23675',
    passwordForRedeem: '',
    colorCode: '006838',
  },
];

export const ownerImg: Prisma.OwnerImgCreateManyInput[] = [
  {
    id: uuidv7(),
    imgPath: '',
    type: 'LOGO',
    ownerId: ownerInfo[0].id,
  },
];
