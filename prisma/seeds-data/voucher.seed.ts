import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

export const categories: Prisma.VoucherCategoryCreateInput[] = [
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

export const tags: Prisma.VoucherTagCreateInput[] = [
  {
    id: uuidv7(),
    name: 'Breakfast',
    voucherCategory: { connect: { id: categories[0].id } },
  },
  {
    id: uuidv7(),
    name: 'Lunch',
    voucherCategory: { connect: { id: categories[0].id } },
  },
  {
    id: uuidv7(),
    name: 'Dinner',
    voucherCategory: { connect: { id: categories[0].id } },
  },
  {
    id: uuidv7(),
    name: 'main courses',
    voucherCategory: { connect: { id: categories[1].id } },
  },
  {
    id: uuidv7(),
    name: 'Drinks',
    voucherCategory: { connect: { id: categories[2].id } },
  },
  {
    id: uuidv7(),
    name: 'Bakery',
    voucherCategory: { connect: { id: categories[2].id } },
  },
];

export const vouchers: Prisma.VoucherCreateInput[] = [
  {
    id: uuidv7(),
    code: 'AA-101',
    title: 'Burger with fries',
    description: 'Juicy burgers with crispy french fries.',
    price: 300,
    voucherTag: { connect: { id: tags[1].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-102',
    title: 'Fried salmon steak',
    description: 'Juicy burgers with crips french fries',
    price: 450,
    voucherTag: { connect: { id: tags[0].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-103',
    title: 'Vegetarian Salad',
    description: 'Fresh and healthy mixed vegetable salad',
    price: 200,
    voucherTag: { connect: { id: tags[1].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-104',
    title: 'Spaghetti Carbonara',
    description: 'Creamy pasta with bacon and Parmesan cheese',
    price: 350,
    voucherTag: { connect: { id: tags[2].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-105',
    title: 'Chicken Caesar Salad',
    description:
      'Grilled chicken with romaine lettuce, croutons, and Caesar dressing',
    price: 250,
    voucherTag: { connect: { id: tags[1].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-106',
    title: 'Hong Kong grilled duck',
    description: 'Grilled duck served with special XO sauce',
    price: 600,
    voucherTag: { connect: { id: tags[3].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-107',
    title: 'Berries Smoothie',
    description: 'A refreshing smoothie made with fresh berries.',
    price: 150,
    voucherTag: { connect: { id: tags[4].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-108',
    title: 'Iced Americano',
    description: 'A special blend iced americano.',
    price: 80,
    voucherTag: { connect: { id: tags[4].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-109',
    title: 'Chocolate Croissant',
    description: 'Flaky pastry filled with rich chocolate.',
    price: 180,
    voucherTag: { connect: { id: tags[5].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-110',
    title: 'Braised Fish Maw in Red Gravy.',
    description: 'Braised fish maw in red gravy',
    price: 700,
    voucherTag: { connect: { id: tags[3].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: uuidv7(),
    code: 'AA-111',
    title: 'Mapo tofu',
    description: 'Spicy and hot tofu.',
    price: 210,
    voucherTag: { connect: { id: tags[3].id } },
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
];

export const voucherImg: Prisma.VoucherImgCreateInput[] = [
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/1735921280934_burger-with-melted-cheese.webp',
    mainImg: true,
    voucher: { connect: { id: vouchers[0].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/fried-salmon-steak-cooked-green-600nw-2489026949.webp',
    mainImg: true,
    voucher: { connect: { id: vouchers[1].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/vegan-salad.jpg',
    mainImg: true,
    voucher: { connect: { id: vouchers[2].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/spaghetti-cabonara.jpg',
    mainImg: true,
    voucher: { connect: { id: vouchers[3].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/220905_DD_Chx-Caesar-Salad_051-500x500.jpg',
    mainImg: true,
    voucher: { connect: { id: vouchers[4].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/Roast-Cantonese-Duck-2022.jpg',
    mainImg: true,
    voucher: { connect: { id: vouchers[5].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/frozen-fruit-smoothie-3.jpg',
    mainImg: true,
    voucher: { connect: { id: vouchers[6].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/Iced-Americano-008s.webp',
    mainImg: true,
    voucher: { connect: { id: vouchers[7].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/SQ_210220_Chocolate-Croissants.webp',
    mainImg: true,
    voucher: { connect: { id: vouchers[8].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/Roast-Cantonese-Duck-2022.jpg',
    mainImg: true,
    voucher: { connect: { id: vouchers[9].id } },
  },
  {
    id: uuidv7(),
    imgPath:
      'https://d22pq9rbvhh9yl.cloudfront.net/voucher-img/กะเพาะปลาน้ำแดง.jpg',
    mainImg: true,
    voucher: { connect: { id: vouchers[10].id } },
  },
];

export const voucherPromotions: Prisma.VoucherPromotionCreateInput[] = [
  {
    name: 'ลดแรงต้อนรับปีใหม่',
    promotionPrice: 199,
    voucher: { connect: { id: vouchers[0].id } },
    sellStartedAt: '2024-12-31T17:00:00Z',
    sellExpiredAt: '2025-02-14T17:00:00Z',
    usableAt: '2025-01-10T00:00:00Z',
    usableExpiredAt: '2025-01-31T17:00:00Z',
  },
  {
    name: 'โปรคุ้มก่อนสิ้นปี',
    promotionPrice: 299,
    voucher: { connect: { id: vouchers[1].id } },
    sellStartedAt: '2024-12-24T17:00:00Z',
    sellExpiredAt: '2025-01-10T17:00:00Z',
    usableAt: '2025-01-10T00:00:00Z',
    usableExpiredAt: '2025-01-31T17:00:00Z',
  },
  {
    name: 'ต้อนรับปีใหม่',
    promotionPrice: 120,
    voucher: { connect: { id: vouchers[10].id } },
    sellStartedAt: '2025-12-31T17:00:00Z',
    sellExpiredAt: '2025-01-31T17:00:00Z',
    usableAt: '2025-01-10T00:00:00Z',
    usableExpiredAt: '2025-02-31T17:00:00Z',
  },
];

export const vouchersTermAndCondEn: Prisma.VoucherTermAndCondENCreateInput[] = [
  {
    id: uuidv7(),
    description: 'This voucher can only be used on Saturday.',
    voucher: { connect: { id: vouchers[0].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher can be used for lunch or dinner.',
    voucher: { connect: { id: vouchers[1].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher is valid for vegetarian meals only.',
    voucher: { connect: { id: vouchers[2].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher can be redeemed for a pasta dish.',
    voucher: { connect: { id: vouchers[3].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher is valid for chicken-based dishes only.',
    voucher: { connect: { id: vouchers[4].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher can only be used on roasted duck dishes.',
    voucher: { connect: { id: vouchers[5].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher is valid for smoothies only.',
    voucher: { connect: { id: vouchers[6].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher is valid for any iced coffee-based drinks.',
    voucher: { connect: { id: vouchers[7].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher is valid for pastries only.',
    voucher: { connect: { id: vouchers[8].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher is valid for seafood-based dishes only.',
    voucher: { connect: { id: vouchers[9].id } },
  },
  {
    id: uuidv7(),
    description: 'This voucher is valid for spicy dishes only.',
    voucher: { connect: { id: vouchers[10].id } },
  },
];

export const vouchersTermAndCondTh: Prisma.VoucherTermAndCondThCreateInput[] = [
  {
    id: uuidv7(),
    description: 'คูปองนี้สามารถใช้ได้เฉพาะในวันเสาร์เท่านั้น',
    voucher: { connect: { id: vouchers[0].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้สามารถใช้ได้สำหรับมื้อกลางวันหรือมื้อเย็นเท่านั้น',
    voucher: { connect: { id: vouchers[1].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้ใช้ได้เฉพาะสำหรับเมนูอาหารมังสวิรัติเท่านั้น',
    voucher: { connect: { id: vouchers[2].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้สามารถใช้ได้กับจานพาสต้าเท่านั้น',
    voucher: { connect: { id: vouchers[3].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้สามารถใช้ได้เฉพาะกับจานที่มีเนื้อไก่เท่านั้น',
    voucher: { connect: { id: vouchers[4].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้สามารถใช้ได้เฉพาะกับจานเป็ดย่างเท่านั้น',
    voucher: { connect: { id: vouchers[5].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้ใช้ได้เฉพาะกับเครื่องดื่มสมูทตี้เท่านั้น',
    voucher: { connect: { id: vouchers[6].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้ใช้ได้เฉพาะกับเครื่องดื่มกาแฟเย็นเท่านั้น',
    voucher: { connect: { id: vouchers[7].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้ใช้ได้เฉพาะกับขนมอบเท่านั้น',
    voucher: { connect: { id: vouchers[8].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้ใช้ได้เฉพาะกับเมนูอาหารทะเลเท่านั้น',
    voucher: { connect: { id: vouchers[9].id } },
  },
  {
    id: uuidv7(),
    description: 'คูปองนี้ใช้ได้เฉพาะกับเมนูอาหารรสจัดเท่านั้น',
    voucher: { connect: { id: vouchers[10].id } },
  },
];
