import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  categories,
  tags,
  voucherImg,
  voucherPromotions,
  vouchers,
  vouchersTermAndCondEn,
  vouchersTermAndCondTh,
} from './seeds-data/voucher.seed';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import {
  packageRewardVouchers,
  packages,
  packageTermAndCondEN,
  packageTermAndCondTH,
} from './seeds-data/package.seed';
import { ownerImg, ownerInfo } from './seeds-data/owner.seed';
import { usableDaysAfterPurchased } from './seeds-data/order.seed';
import { accounts } from './seeds-data/account.seed';
import { transactionSystem } from './seeds-data/transaction.seed';
config({ path: '.env.development' });

const prisma = new PrismaClient();

const seedingFunc = async (
  func: Function,
  data: any,
  str: string,
): Promise<void> => {
  try {
    console.log(`<==== START SEEDING ${str} ====>`);
    await func({ data });
    console.log(`...FINISH SEEDING ${str}...`);
  } catch (err) {
    console.error(err);
  }
};

const seed = async (): Promise<void> => {
  console.log('-------- START SEEDING PROCESS --------');
  const password = bcrypt.hashSync('Qwerty', 10);
  /**
   * Function to seed data to database
   */
  accounts.forEach((item) => (item.password = password));
  console.log('INTO SEEDING PROCESS... PLEASE WAIT.');

  await Promise.all([
    seedingFunc(prisma.account.createMany, accounts, 'accounts'),
    seedingFunc(prisma.voucherCategory.createMany, categories, 'categories'),
  ]);
  await seedingFunc(prisma.voucherTag.createMany, tags, 'voucher-tag');
  await seedingFunc(prisma.voucher.createMany, vouchers, 'vouchers');
  await seedingFunc(
    prisma.packageVoucher.createMany,
    packages,
    'package-vouchers',
  );
  await seedingFunc(prisma.owner.createMany, ownerInfo, 'owner-information');
  await seedingFunc(
    prisma.usableDaysAfterPurchased.create,
    usableDaysAfterPurchased,
    'Usable days after purchased.',
  );
  await seedingFunc(
    prisma.transactionSystem.create,
    transactionSystem,
    'Transaction-system.',
  );
  await Promise.all([
    seedingFunc(prisma.voucherImg.createMany, voucherImg, 'voucher-img'),
    seedingFunc(
      prisma.voucherTermAndCondEN.createMany,
      vouchersTermAndCondEn,
      'voucher-term-and-condition-EN',
    ),
    seedingFunc(
      prisma.voucherTermAndCondTh.createMany,
      vouchersTermAndCondTh,
      'voucher-term-and-condition-TH',
    ),
    seedingFunc(
      prisma.voucherPromotion.createMany,
      voucherPromotions,
      'voucher-promotion',
    ),
    seedingFunc(
      prisma.packageRewardVoucher.createMany,
      packageRewardVouchers,
      'package-reward-vouchers',
    ),
    seedingFunc(
      prisma.packageVoucherTermAndCondTH.createMany,
      packageTermAndCondTH,
      'package-voucher-term-and-condition-TH',
    ),
    seedingFunc(
      prisma.packageVoucherTermAndCondEN.createMany,
      packageTermAndCondEN,
      'package-voucher-term-and-condition-EN',
    ),
    seedingFunc(prisma.ownerImg.createMany, ownerImg, 'owner-images'),
  ]);
};

async function main() {
  try {
    console.log('--- START --- \n--- RESET DB --- \n--- PROCESS ---');

    await prisma.$connect();

    execSync('pnpx prisma migrate reset --force');
    await seed();
    console.log('SEEDING COMPLETED SUCCESSFULLY');
  } catch (err) {
    console.error(err);
  }
}

main();
