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
import { execSync, spawnSync } from 'child_process';
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

const resetDb = () => {
  const reset = spawnSync('npx', ['prisma', 'migrate', 'reset', '--force'], {
    stdio: 'inherit',
    shell: true,
  });

  if (reset.status !== 0) {
    throw new Error('Prisma migrate reset failed');
  }

  // 3. Regenerate Prisma client explicitly
  console.log('\nREGENERATING PRISMA CLIENT...');
  const generate = spawnSync('npx', ['prisma', 'generate'], {
    stdio: 'inherit',
    shell: true,
  });

  if (generate.status !== 0) {
    throw new Error('Prisma generate failed');
  }

  // Continue with seeding data...
  console.log('\nSEEDING DATA...');
  // Your seeding logic here
};

async function main() {
  try {
    console.log('--- START ---\n--- RESET DB ---\n--- PROCESS ---');

    // // 1. Clean up existing connections
    // console.log('Disconnecting from database...');
    // await prisma.$disconnect();

    // // 2. Reset database with clean client generation
    // console.log('\nRESETTING DATABASE...');
    // resetDb();

    // // 4. Regenerate Prisma client explicitly
    // console.log('\nREGENERATING PRISMA CLIENT...');
    execSync('prisma generate', { stdio: 'inherit' });

    // 5. Reconnect with fresh client
    console.log('\nRECONNECTING TO DATABASE...');
    await prisma.$connect();

    // 6. Verify and seed
    console.log('\nVERIFYING DATABASE STATE...');

    console.log('\nSEEDING DATABASE...');
    await seed();
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    console.log('...FINISH SEEDING...');
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
