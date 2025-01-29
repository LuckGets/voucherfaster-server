-- CreateEnum
CREATE TYPE "AccountProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DiscountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionExpireUnit" AS ENUM ('SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "OwnerImgType" AS ENUM ('BACKGROUND', 'LOGO');

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL,
    "fullname" VARCHAR(90) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(191) NOT NULL,
    "password" VARCHAR(90),
    "photo" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "social_id" TEXT,
    "account_provider" "AccountProvider" DEFAULT 'LOCAL',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "verified_at" TIMESTAMPTZ(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "account_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(90) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_tag" (
    "id" UUID NOT NULL,
    "name" VARCHAR(90) NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "voucher_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher" (
    "id" UUID NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "status" "VoucherStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "termAndCondition" TEXT NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "stock_amount" INTEGER NOT NULL,
    "tag_id" UUID NOT NULL,
    "usable_at" TIMESTAMPTZ(3) NOT NULL,
    "usage_expired_at" TIMESTAMPTZ(3) NOT NULL,
    "sell_started_at" TIMESTAMPTZ(3) NOT NULL,
    "sale_expired_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_img" (
    "id" UUID NOT NULL,
    "img_path" TEXT NOT NULL,
    "voucher_id" UUID NOT NULL,
    "main_img" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "voucher_img_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_discount" (
    "id" UUID NOT NULL,
    "discounted_price" DECIMAL(8,2) NOT NULL,
    "voucher_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "status" "DiscountStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "voucher_discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_discount" (
    "id" UUID NOT NULL,
    "discounted_price" DECIMAL(8,2) NOT NULL,
    "voucher_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "status" "DiscountStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "package_discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_voucher" (
    "id" UUID NOT NULL,
    "quota_voucher_id" UUID NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "description" TEXT NOT NULL,
    "stock_amount" INTEGER NOT NULL,
    "termAndCondition" TEXT NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "quota_amount" SMALLINT NOT NULL,
    "sell_started_at" TIMESTAMPTZ(3) NOT NULL,
    "sell_expired_at" TIMESTAMPTZ(3) NOT NULL,
    "usable_at" TIMESTAMPTZ(3) NOT NULL,
    "usable_expired_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "VoucherStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "package_voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_img" (
    "id" UUID NOT NULL,
    "img_path" TEXT NOT NULL,
    "package_id" UUID NOT NULL,
    "main_img" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "package_img_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_reward_voucher" (
    "id" UUID NOT NULL,
    "reward_voucher_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "package_id" UUID NOT NULL,

    CONSTRAINT "package_reward_voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" UUID NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "account_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "countNumber" INTEGER NOT NULL,
    "qrcode_image_path" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "usable_at" TIMESTAMPTZ(3) NOT NULL,
    "usable_expired_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_voucher" (
    "id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "voucher_id" UUID NOT NULL,
    "voucher_discount_id" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "order_item_voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_package" (
    "id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "reward_voucher" BOOLEAN NOT NULL,
    "package_discount_id" UUID,
    "voucher_id" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "order_item_package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redeemed_order_item" (
    "id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "redeemed_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_system" (
    "id" UUID NOT NULL,
    "system" VARCHAR(90) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "transaction_system_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_expire_time" (
    "id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "unit" "TransactionExpireUnit" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "transaction_expire_time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "payment_id" VARCHAR(90),
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "expired_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "transaction_system_id" UUID NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner" (
    "id" UUID NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "email_for_sending_voucher" VARCHAR(191) NOT NULL,
    "password_for_email" VARCHAR(191) NOT NULL,
    "password_for_redeem" VARCHAR(191) NOT NULL,
    "color_code" VARCHAR(90) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_img" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "img_path" TEXT NOT NULL,
    "img_type" "OwnerImgType" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "owner_img_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_phone_key" ON "account"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_social_id_key" ON "account"("social_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_account_id_key" ON "session"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_discount_voucher_id_key" ON "voucher_discount"("voucher_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_discount_voucher_id_key" ON "package_discount"("voucher_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_code_key" ON "order_item"("code");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_voucher_order_item_id_key" ON "order_item_voucher"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_package_order_item_id_key" ON "order_item_package"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "redeemed_order_item_order_item_id_key" ON "redeemed_order_item"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_system_system_key" ON "transaction_system"("system");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_order_id_key" ON "transaction"("order_id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_tag" ADD CONSTRAINT "voucher_tag_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "voucher_tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_img" ADD CONSTRAINT "voucher_img_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_discount" ADD CONSTRAINT "voucher_discount_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_discount" ADD CONSTRAINT "package_discount_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_voucher" ADD CONSTRAINT "package_voucher_quota_voucher_id_fkey" FOREIGN KEY ("quota_voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_img" ADD CONSTRAINT "package_img_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_reward_voucher" ADD CONSTRAINT "package_reward_voucher_reward_voucher_id_fkey" FOREIGN KEY ("reward_voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_reward_voucher" ADD CONSTRAINT "package_reward_voucher_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_voucher" ADD CONSTRAINT "order_item_voucher_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_voucher" ADD CONSTRAINT "order_item_voucher_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_voucher" ADD CONSTRAINT "order_item_voucher_voucher_discount_id_fkey" FOREIGN KEY ("voucher_discount_id") REFERENCES "voucher_discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package" ADD CONSTRAINT "order_item_package_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package" ADD CONSTRAINT "order_item_package_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package" ADD CONSTRAINT "order_item_package_package_discount_id_fkey" FOREIGN KEY ("package_discount_id") REFERENCES "package_discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package" ADD CONSTRAINT "order_item_package_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redeemed_order_item" ADD CONSTRAINT "redeemed_order_item_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_transaction_system_id_fkey" FOREIGN KEY ("transaction_system_id") REFERENCES "transaction_system"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_img" ADD CONSTRAINT "owner_img_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
