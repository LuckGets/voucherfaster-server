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

export const vouchers: Prisma.VoucherCreateManyInput[] = [
  {
    id: vouchersId[0],
    title: 'Burger with fries',
    description: 'Juicy burgers with crispy french fries.',
    price: 300,
    tagId: tags[1].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[1],
    title: 'Fried salmon steak',
    description: 'Juicy burgers with crips french fries',
    price: 450,
    tagId: tags[0].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[2],
    title: 'Vegetarian Salad',
    description: 'Fresh and healthy mixed vegetable salad',
    price: 200,
    tagId: tags[1].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[3],
    title: 'Spaghetti Carbonara',
    description: 'Creamy pasta with bacon and Parmesan cheese',
    price: 350,
    tagId: tags[2].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[4],
    title: 'Chicken Caesar Salad',
    description:
      'Grilled chicken with romaine lettuce, croutons, and Caesar dressing',
    price: 250,
    tagId: tags[1].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[5],
    title: 'Hong Kong grilled duck',
    description: 'Grilled duck served with special XO sauce',
    price: 600,
    tagId: tags[3].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[6],
    title: 'Berries Smoothie',
    description: 'A refreshing smoothie made with fresh berries.',
    price: 150,
    tagId: tags[4].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[7],
    title: 'Iced Americano',
    description: 'A special blend iced americano.',
    price: 80,
    tagId: tags[4].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[8],
    title: 'Chocolate Croissant',
    description: 'Flaky pastry filled with rich chocolate.',
    price: 180,
    tagId: tags[5].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[9],
    title: 'Braised Fish Maw in Red Gravy.',
    description: 'Braised fish maw in red gravy',
    price: 700,
    tagId: tags[3].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
  },
  {
    id: vouchersId[10],
    title: 'Mapo tofu',
    description: 'Spicy and hot tofu.',
    price: 210,
    tagId: tags[3].id,
    usageExpiredTime: '2025-12-25T17:00:00.000Z',
    saleExpiredTime: '2025-12-25T17:00:00.000Z',
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

export const voucherPromotions: Prisma.VoucherPromotionCreateManyInput[] = [
  {
    name: 'ลดแรงต้อนรับปีใหม่',
    promotionPrice: 199,
    voucherId: vouchers[0].id,
    sellStartedAt: '2024-12-31T17:00:00.000Z',
    sellExpiredAt: '2025-02-14T17:00:00.000Z',
    usableAt: '2025-01-10T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    name: 'โปรคุ้มก่อนสิ้นปี',
    promotionPrice: 299,
    voucherId: vouchers[1].id,
    sellStartedAt: '2024-12-24T17:00:00.000Z',
    sellExpiredAt: '2025-01-10T17:00:00.000Z',
    usableAt: '2025-01-10T17:00:00.000Z',
    usableExpiredAt: '2025-01-31T17:00:00.000Z',
  },
  {
    name: 'ต้อนรับปีใหม่',
    promotionPrice: 120,
    voucherId: vouchers[10].id,
    sellStartedAt: '2025-12-31T17:00:00.000Z',
    sellExpiredAt: '2025-01-31T17:00:00.000Z',
    usableAt: '2025-01-10T17:00:00.000Z',
    usableExpiredAt: '2025-02-28T17:00:00.000Z',
  },
];

export const vouchersTermAndCondEn: Prisma.VoucherTermAndCondENCreateManyInput[] =
  [
    {
      id: uuidv7(),
      description: 'This voucher can only be used on Saturday.',
      voucherId: vouchers[0].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher can be used for lunch or dinner.',
      voucherId: vouchers[1].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher is valid for vegetarian meals only.',
      voucherId: vouchers[2].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher can be redeemed for a pasta dish.',
      voucherId: vouchers[3].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher is valid for chicken-based dishes only.',
      voucherId: vouchers[4].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher can only be used on roasted duck dishes.',
      voucherId: vouchers[5].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher is valid for smoothies only.',
      voucherId: vouchers[6].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher is valid for any iced coffee-based drinks.',
      voucherId: vouchers[7].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher is valid for pastries only.',
      voucherId: vouchers[8].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher is valid for seafood-based dishes only.',
      voucherId: vouchers[9].id,
    },
    {
      id: uuidv7(),
      description: 'This voucher is valid for spicy dishes only.',
      voucherId: vouchers[10].id,
    },
  ];

export const vouchersTermAndCondTh: Prisma.VoucherTermAndCondThCreateManyInput[] =
  [
    {
      id: uuidv7(),
      description: 'คูปองนี้สามารถใช้ได้เฉพาะในวันเสาร์เท่านั้น',
      voucherId: vouchers[0].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้สามารถใช้ได้สำหรับมื้อกลางวันหรือมื้อเย็นเท่านั้น',
      voucherId: vouchers[1].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้ใช้ได้เฉพาะสำหรับเมนูอาหารมังสวิรัติเท่านั้น',
      voucherId: vouchers[2].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้สามารถใช้ได้กับจานพาสต้าเท่านั้น',
      voucherId: vouchers[3].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้สามารถใช้ได้เฉพาะกับจานที่มีเนื้อไก่เท่านั้น',
      voucherId: vouchers[4].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้สามารถใช้ได้เฉพาะกับจานเป็ดย่างเท่านั้น',
      voucherId: vouchers[5].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้ใช้ได้เฉพาะกับเครื่องดื่มสมูทตี้เท่านั้น',
      voucherId: vouchers[6].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้ใช้ได้เฉพาะกับเครื่องดื่มกาแฟเย็นเท่านั้น',
      voucherId: vouchers[7].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้ใช้ได้เฉพาะกับขนมอบเท่านั้น',
      voucherId: vouchers[8].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้ใช้ได้เฉพาะกับเมนูอาหารทะเลเท่านั้น',
      voucherId: vouchers[9].id,
    },
    {
      id: uuidv7(),
      description: 'คูปองนี้ใช้ได้เฉพาะกับเมนูอาหารรสจัดเท่านั้น',
      voucherId: vouchers[10].id,
    },
  ];
