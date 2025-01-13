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
import { config } from 'dotenv';
import { execSync } from 'child_process';
import {
  packages,
  packageTermAndCondEN,
  packageTermAndCondTH,
} from './seeds-data/package.seed';
import { ownerImg, ownerInfo } from './seeds-data/owner.seed';
config({ path: '.env.development' });

const prisma = new PrismaClient();

const accounts: Prisma.AccountCreateInput[] = [
  {
    id: uuidv7(),
    email: 'johndoe@mail.com',
    fullname: 'John doe',
    phone: '0812345678',
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.User,
  },
  {
    id: uuidv7(),
    email: 'admin@admin.com',
    fullname: 'ADMIN1',
    phone: '0812345888',
    accountProvider: AccountProviderEnum.Local,
    role: RoleEnum.Admin,
  },
];

const seedingFunc = async (
  func: Function,
  data: any,
  str: string,
): Promise<void> => {
  try {
    console.log(`<==== START SEEDING ${str} ====>`);
    await func({ data, skipDuplicates: true });
    console.log(`...FINISH SEEDING ${str}...`);
  } catch (err) {
    console.error(err);
  }
};

const seed = async (): Promise<void> => {
  try {
    console.log('-------- START SEEDING PROCESS --------');
    const password = bcrypt.hashSync('Qwerty', 10);
    accounts.forEach((item) => (item.password = password));
    console.log('INTO THE SEEDING PROCESS... PLEASE WAIT.');

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
        prisma.packageVoucherTermAndCondTH.createMany,
        packageTermAndCondTH,
        'package-voucher-term-and-condition-TH',
      ),
      seedingFunc(
        prisma.packageVoucherTermAndCondEN.createMany,
        packageTermAndCondEN,
        'package-voucher-term-and-condition-EN',
      ),
      // seedingFunc(prisma.ownerImg.createMany, ownerImg, 'owner-images'),
    ]);
  } catch (err) {
    console.error(err);
  }
};

async function main() {
  try {
    console.log('--- START --- \n--- RESET DB --- \n--- PROCESS ---');

    await prisma.$connect();

    execSync('pnpx prisma migrate reset --force');
    await seed();
    console.log('SEEDING COMPLETED SUCCESSFULLY');
  } catch (err) {
    console.log(err);
  }
}

main();
