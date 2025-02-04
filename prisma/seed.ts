import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  categories,
  tags,
  voucherDiscounts,
  voucherImg,
  vouchers,
} from './seeds-data/voucher.seed';
import { execSync } from 'child_process';
import {
  packageImgs,
  packageQuotaVouchers,
  packageRewardVouchers,
  packages,
} from './seeds-data/package.seed';
import { ownerImg, ownerInfo } from './seeds-data/owner.seed';
import {
  orderItemPackageRewards,
  orderItems,
  orderItemsPackageQuotas,
  orderItemsVouher,
  orders,
} from './seeds-data/order.seed';
import { accounts } from './seeds-data/account.seed';
import {
  transactionExpireTime,
  transactionsOfOrders,
  transactionSystem,
} from './seeds-data/transaction.seed';

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
    throw err;
  }
};

const seed = async (): Promise<void> => {
  try {
    console.log('-------- START SEEDING PROCESS --------');

    const isSeedingAccountExist = await prisma.account.findFirst({
      where: {
        email: accounts[0].email,
      },
    });

    const isCategoryExist = await prisma.category.findFirst({
      where: {
        name: categories[0].name,
      },
    });

    if (isSeedingAccountExist || isCategoryExist) {
      console.log(
        'The database have already populated with data. STOP seeding process....',
      );
      return;
    }
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
        prisma.packageQuotaVoucher.createMany,
        packageQuotaVouchers,
        'package-quota',
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
        prisma.orderItemPackageQuota.createMany,
        orderItemsPackageQuotas,
        'order-items-package',
      ),
      seedingFunc(
        prisma.orderItemPackageReward.createMany,
        orderItemPackageRewards,
        'order-items-rewards',
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

async function main() {
  try {
    console.log('--- START ---\n--- RESET DB ---\n--- PROCESS ---');

    execSync('prisma generate', { stdio: 'inherit' });

    // 5. Reconnect with fresh client
    console.log('\nRECONNECTING TO DATABASE...');
    await prisma.$connect();

    console.log('\nSEEDING DATABASE...');
    await seed();
  } catch (err) {
    console.error(err);
    throw new Error(err);
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
