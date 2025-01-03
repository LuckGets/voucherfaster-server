import { Prisma, PrismaClient } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import {
  AccountProviderEnum,
  RoleEnum,
} from '../src/resources/account/types/account.type';
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
import { execSync } from 'child_process';
import { config } from 'dotenv';
config({ path: '.env.development' });

const prisma = new PrismaClient();

const accounts: Prisma.AccountCreateInput[] = [
  {
    id: uuidv7(),
    email: 'johndoe@mail.com',
    fullname: 'John doe',
    phone: '0812345678',
    password: 'Qwerty',
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.User,
  },
  {
    id: uuidv7(),
    email: 'admin@admin.com',
    fullname: 'ADMIN1',
    phone: '0812345888',
    password: 'Adminn',
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.Admin,
  },
];

const seedingFunc = async (
  func: Function,
  data: any,
  str: string,
): Promise<void> => {
  console.log(`<==== START SEEDING ${str} ====>`);
  await func({ data });
  console.log(`...FINISH SEEDING ${str}...`);
};

const seed = async (): Promise<void> => {
  try {
    console.log('-------- START SEEDING PROCESS --------');
    const password = bcrypt.hashSync('Qwerty', 10);
    accounts.forEach((item) => (item.password = password));
    await prisma.$transaction(async (tx) => {
      console.log('INTO THE SEEDING PROCESS... PLEASE WAIT.');

      console.log('SEEDING ACCOUNT AND CATEGORIES');
      await Promise.all([
        tx.account.createMany({ data: accounts }),
        tx.voucherCategory.createMany({ data: categories }),
      ]);
      seedingFunc(tx.voucherTag.createMany, tags, 'voucher-tag');
      seedingFunc(tx.voucher.createMany, vouchers, 'vouchers');
      seedingFunc(tx.voucherImg.createMany, voucherImg, 'voucher-img');
      seedingFunc(
        tx.voucherTermAndCondEN.createMany,
        vouchersTermAndCondEn,
        'voucher-term-and-condition-EN',
      );
      seedingFunc(
        tx.voucherTermAndCondTh.createMany,
        vouchersTermAndCondTh,
        'voucher-term-and-condition-TH',
      );
      seedingFunc(
        tx.voucherPromotion.createMany,
        voucherPromotions,
        'voucher-promotion',
      );
    });
  } catch (err) {
    console.error(err);
  }
};

async function main() {
  try {
    console.log('--- START --- \n--- RESET DB --- \n--- PROCESS ---');
    // Disconnect Prisma Client to avoid open connections
    await prisma.$disconnect();

    await prisma.$executeRawUnsafe('DROP DATABASE IF EXISTS voucherfaster');
    await prisma.$executeRawUnsafe('CREATE DATABASE voucherfaster');

    execSync('pnpm prisma db push', { stdio: 'inherit' });

    await seed();
  } catch (err) {
    console.log(err);
  }
}

main();
