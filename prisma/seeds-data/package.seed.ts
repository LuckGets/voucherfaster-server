import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { tags, vouchers } from './voucher.seed';

export const packageVoucherId = Array(2)
  .fill('')
  .map(() => uuidv7());

const termAndConditionSeedInfo = `<h1>ใบอนุญาตไทย71 Premium Buffet Dinner 1+0 Free1:Coupon8/10</h1>
    <p>Ref. 2FCHD No. 1/1</p>
    <p>Order No. 2024082558649924</p>
    <p><strong>Expiry Date. 30 Dec 24 - 23:59</strong></p>
    <h2>ราคานี้รวมเครื่องดื่มประเภท น้ำอัดลม ชา กาแฟ รับประทานได้แบบไม่จำกัดเวลา ตั้งแต่เวลา 18:00 - 22:00 น.</h2>
    <p>ห้องอาหารดีเอมเมอร์ลด์ ชั้น 1 โรงแรมดีเอมเมอร์ลด์ MRT สถานีห้วยขวาง ทางออก 3</p>
    <p>หลังสั่งซื้อแล้ว ทางโรงแรมจะไม่รับเปลี่ยนหรือคืนสินค้าทุกกรณี</p>
    <h3>เงื่อนไขการใช้บริการ E-Voucher ไทยเที่ยวไทย71</h3>
    <ul>
      <li>E-Voucher นี้สามารถใช้ได้ตั้งแต่วันที่ 26 สิงหาคม - 30 ธันวาคม 67 เท่านั้น!</li>
      <li>E-Voucher ใช้ได้ที่ห้องอาหารดีเอมเมอร์ลด์ ชั้น 1 โรงแรมดีเอมเมอร์ลด์ (1 E-Voucher สำหรับ 1 ท่าน เท่านั้น!)</li>
      <li>เมื่อลูกค้าได้รับ E-Voucher ผ่าน Line หรือ E-mail แล้ว สามารถจองล่วงหน้าอย่างน้อย 3 วัน เพื่อเข้าใช้บริการได้เลยค่ะ</li>
    </ul>
    <h3>วิธีใช้บริการ E-Voucher</h3>
    <ul>
      <li>เมื่อมาใช้บริการ ลูกค้าจะต้องแสดง E-Voucher ผ่าน Line หรือ E-mail เท่านั้น ณ ที่ห้องอาหารเพื่อเข้ารับบริการ</li>
      <li>ไม่สามารถแคปหน้าจอหรือบอกเพียงรหัสได้</li>
      <li>E-Voucher ใช้ได้เพียง 1 ครั้ง ไม่สามารถใช้ซ้ำได้</li>
      <li>E-Voucher ไม่สามารถใช้ร่วมกับโปรโมชั่น และ/หรือส่วนลดอื่น ๆ ได้</li>
      <li>เมื่อมีการสั่งซื้อสำเร็จแล้วจะไม่สามารถยกเลิกหรือคืนเงินได้ ทุกกรณี</li>
      <li>โรงแรมฯ ไม่รับผิดชอบต่อการสูญหายหรือการขโมยบัตรรับประทานอาหาร และไม่สามารถเปลี่ยนทดแทนได้หากสูญหาย/ถูกขโมย/หมดอายุ</li>
      <li>โรงแรมฯ ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
    </ul>`;

export const packages: Prisma.PackageVoucherCreateManyInput[] = [
  {
    id: packageVoucherId[0],
    title: 'โปรโมชั่นแพ็คเกจ ซื้อ1แถม1',
    description: 'โปรโมชั่นซื้อ 1 แถม 1',
    tagId: tags[1].id,
    termAndCondition: termAndConditionSeedInfo,
    quotaVoucherId: vouchers[0].id,
    quotaAmount: 1,
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
    sellStartedAt: '2024-12-31T17:00:00.000Z',
    sellExpiredAt: '2025-01-31T17:00:00.000Z',
    stockAmount: 100,
    price: 300,
  },
  {
    id: packageVoucherId[1],
    title: 'เป็ดฮ่องกงแซ่บๆ 2 แถม 1',
    description: 'เป็ดฮ่องกงแซ่บๆ 2 แถม 1',
    termAndCondition: termAndConditionSeedInfo,
    stockAmount: 100,
    tagId: tags[3].id,
    quotaVoucherId: vouchers[5].id,
    quotaAmount: 2,
    price: 1200,
    usableAt: '2024-12-31T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
    sellStartedAt: '2024-12-31T17:00:00.000Z',
    sellExpiredAt: '2025-01-31T17:00:00.000Z',
  },
];

export const packageRewardVouchers: Prisma.PackageRewardVoucherCreateManyInput[] =
  [
    {
      id: uuidv7(),
      packageId: packages[0].id,
      amount: 1,
      rewardVoucherId: vouchers[0].id,
    },
    {
      id: uuidv7(),
      packageId: packages[1].id,
      amount: 1,
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
    packageId: packages[1].id,
  },
];
