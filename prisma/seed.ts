import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  categories,
  tags,
  voucherDiscounts,
  voucherImg,
  vouchers,
} from './seeds-data/voucher.seed';
import { config } from 'dotenv';
import { exec, execFile, execSync } from 'child_process';
import {
  packageImgs,
  packageRewardVouchers,
  packages,
} from './seeds-data/package.seed';
import { ownerImg, ownerInfo } from './seeds-data/owner.seed';
import {
  orderItems,
  orderItemsPackage,
  orderItemsVouher,
  orders,
} from './seeds-data/order.seed';
import { accounts } from './seeds-data/account.seed';
import {
  transactionExpireTime,
  transactionsOfOrders,
  transactionSystem,
} from './seeds-data/transaction.seed';
import * as util from 'util';
import * as path from 'path';
config({ path: '.env.development', override: true });

const prisma = new PrismaClient();

console.log(
  'Loaded Prisma version: ',
  require('@prisma/client/package.json').version,
);

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
    throw err;
  }
};

const seed = async (): Promise<void> => {
  try {
    console.log('-------- START SEEDING PROCESS --------');
    const password = bcrypt.hashSync('Qwerty', 10);
    // const ownerPasswordForRedeem = CryptoService.encrypt(password, process.env.PASSWORD_FOR_REDEEM_SECRET);

    console.log('accounts:', accounts);
    console.log('categories:', categories);

    /**
     * Function to seed data to database
     */
    accounts.forEach((item) => (item.password = password));
    ownerInfo.forEach((item) => (item.passwordForRedeem = password));
    console.log('INTO SEEDING PROCESS... PLEASE WAIT.');

    await Promise.all([
      seedingFunc(prisma.account.createMany, accounts, 'accounts'),
      seedingFunc(prisma.category.createMany, categories, 'categories'),
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
      prisma.transactionSystem.create,
      transactionSystem,
      'Transaction-system.',
    );
    await seedingFunc(prisma.order.createMany, orders, 'orders');
    await seedingFunc(prisma.orderItem.createMany, orderItems, 'order-items');
    await Promise.all([
      seedingFunc(prisma.voucherImg.createMany, voucherImg, 'voucher-img'),
      seedingFunc(
        prisma.voucherDiscount.createMany,
        voucherDiscounts,
        'voucher-promotion',
      ),
      seedingFunc(
        prisma.packageRewardVoucher.createMany,
        packageRewardVouchers,
        'package-reward-vouchers',
      ),
      seedingFunc(prisma.packageImg.createMany, packageImgs, 'package-image'),
      seedingFunc(prisma.ownerImg.createMany, ownerImg, 'owner-images'),
      seedingFunc(
        prisma.transaction.createMany,
        transactionsOfOrders,
        'order-transactions',
      ),
      seedingFunc(
        prisma.orderItemVoucher.createMany,
        orderItemsVouher,
        'order-items-voucher',
      ),
      seedingFunc(
        prisma.orderItemPackage.createMany,
        orderItemsPackage,
        'order-items-package',
      ),
      seedingFunc(
        prisma.transactionExpireTime.create,
        transactionExpireTime,
        'transaction-expire-time',
      ),
    ]);
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

async function resetDB() {
  try {
    const execPromise = util.promisify(execFile);
    // Use explicit paths to avoid path length issues
    const prismaPath = path.join('./node_modules/.bin/prisma.cmd');

    const { stderr } = await execPromise(
      prismaPath,
      ['migrate', 'reset', '--force'],
      { windowsVerbatimArguments: true },
    );
    if (stderr) {
      console.error(stderr);
    }
  } catch (err) {
    console.error('Error resetting database:', err);
    throw err;
  }
}

async function main() {
  try {
    console.log('--- START --- \n--- RESET DB --- \n--- PROCESS ---');

    console.log('Connect to database...');
    await prisma.$connect();
    console.log('Connect to database success!');

    console.log('RESET ALL THE DATABASE DATA...');
    await resetDB();
    console.log('RESET SUCCESS');
    // Verify reset (optional)
    const existingCategories = await prisma.category.findMany();
    console.log('Existing categories after reset:', existingCategories); // Should be empty
    await seed();
    console.log('SEEDING COMPLETED SUCCESSFULLY');
  } catch (err) {
    console.error(err);
  }
}

main();
