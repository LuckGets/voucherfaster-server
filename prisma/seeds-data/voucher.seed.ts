import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

export const categories: Prisma.CategoryCreateInput[] = [
  {
    id: uuidv7(),
    name: 'All-international',
  },
  {
    id: uuidv7(),
    name: 'Yok chinese restaurant',
  },
  {
    id: uuidv7(),
    name: 'Coffee Shop',
  },
];

export const tags: Prisma.VoucherTagCreateManyInput[] = [
  {
    id: uuidv7(),
    name: 'Breakfast',
    categoryId: categories[0].id,
  },
  {
    id: uuidv7(),
    name: 'Lunch',
    categoryId: categories[0].id,
  },
  {
    id: uuidv7(),
    name: 'Dinner',
    categoryId: categories[0].id,
  },
  {
    id: uuidv7(),
    name: 'main courses',
    categoryId: categories[1].id,
  },
  {
    id: uuidv7(),
    name: 'Drinks',
    categoryId: categories[2].id,
  },
  {
    id: uuidv7(),
    name: 'Bakery',
    categoryId: categories[2].id,
  },
];

const vouchersId = Array(11)
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

export const vouchers: Prisma.VoucherCreateManyInput[] = [
  {
    id: vouchersId[0],
    title: 'Burger with fries',
    description: 'Juicy burgers with crispy french fries.',
    termAndCondition: termAndConditionSeedInfo,
    status: 'ACTIVE',
    stockAmount: 10000,
    price: 300,
    tagId: tags[1].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[1],
    title: 'Fried salmon steak',
    stockAmount: 10000,
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    description: 'Juicy burgers with crips french fries',
    price: 450,
    tagId: tags[0].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[2],
    title: 'Vegetarian Salad',
    stockAmount: 10000,
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    description: 'Fresh and healthy mixed vegetable salad',
    price: 200,
    tagId: tags[1].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[3],
    title: 'Spaghetti Carbonara',
    stockAmount: 10000,
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    description: 'Creamy pasta with bacon and Parmesan cheese',
    price: 350,
    tagId: tags[2].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[4],
    title: 'Chicken Caesar Salad',
    stockAmount: 10000,
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    description:
      'Grilled chicken with romaine lettuce, croutons, and Caesar dressing',
    price: 250,
    tagId: tags[1].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[5],
    title: 'Hong Kong grilled duck',
    stockAmount: 10000,
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    description: 'Grilled duck served with special XO sauce',
    price: 600,
    tagId: tags[3].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[6],
    title: 'Berries Smoothie',
    stockAmount: 10000,
    description: 'A refreshing smoothie made with fresh berries.',
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    price: 150,
    tagId: tags[4].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[7],
    title: 'Iced Americano',
    stockAmount: 10000,
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    description: 'A special blend iced americano.',
    price: 80,
    tagId: tags[4].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[8],
    title: 'Chocolate Croissant',
    stockAmount: 10000,
    description: 'Flaky pastry filled with rich chocolate.',
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    price: 180,
    tagId: tags[5].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[9],
    title: 'Braised Fish Maw in Red Gravy.',
    stockAmount: 10000,
    description: 'Braised fish maw in red gravy',
    price: 700,
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    tagId: tags[3].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[10],
    title: 'Mapo tofu',
    stockAmount: 10000,
    description: 'Spicy and hot tofu.',
    status: 'ACTIVE',
    termAndCondition: termAndConditionSeedInfo,
    price: 210,
    tagId: tags[3].id,
    usableAt: '2024-12-31T17:00:00.000Z',
    sellStartedAt: '2024-12-25T17:00:00.000Z',
    usableExpiredAt: '2025-12-25T17:00:00.000Z',
    sellExpiredAt: '2025-12-25T17:00:00.000Z',
  },
];

export const voucherImg: Prisma.VoucherImgCreateManyInput[] = [
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp',
    mainImg: true,
    voucherId: vouchers[0].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/fried-salmon-steak-cooked-green-600nw-2489026949.webp',
    mainImg: true,
    voucherId: vouchers[1].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/vegan-salad.jpg',
    mainImg: true,
    voucherId: vouchers[2].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/spaghetti-cabonara.jpg',
    mainImg: true,
    voucherId: vouchers[3].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/220905_DD_Chx-Caesar-Salad_051-500x500.jpg',
    mainImg: true,
    voucherId: vouchers[4].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/Roast-Cantonese-Duck-2022.jpg',
    mainImg: true,
    voucherId: vouchers[5].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/frozen-fruit-smoothie-3.jpg',
    mainImg: true,
    voucherId: vouchers[6].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/Iced-Americano-008s.webp',
    mainImg: true,
    voucherId: vouchers[7].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/SQ_210220_Chocolate-Croissants.webp',
    mainImg: true,
    voucherId: vouchers[8].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/Roast-Cantonese-Duck-2022.jpg',
    mainImg: true,
    voucherId: vouchers[9].id,
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/กะเพาะปลาน้ำแดง.jpg',
    mainImg: true,
    voucherId: vouchers[10].id,
  },
];

export const voucherDiscounts: Prisma.VoucherDiscountCreateManyInput[] = [
  {
    id: uuidv7(),
    status: 'ACTIVE',
    discountedPrice: 199,
    voucherId: vouchers[0].id,
  },
  {
    id: uuidv7(),
    status: 'ACTIVE',
    discountedPrice: 299,
    voucherId: vouchers[1].id,
  },
  {
    id: uuidv7(),
    status: 'ACTIVE',
    discountedPrice: 120,
    voucherId: vouchers[2].id,
  },
  {
    id: uuidv7(),
    status: 'ACTIVE',
    discountedPrice: 599,
    voucherId: vouchers[10].id,
  },
];
