-- CreateEnum
CREATE TYPE "AccountProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Otp" (
    "id" UUID NOT NULL,
    "account_email" VARCHAR(191) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL,
    "fullname" VARCHAR(90) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
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
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherCategory" (
    "id" UUID NOT NULL,
    "name" VARCHAR(90) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "VoucherCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherTag" (
    "id" UUID NOT NULL,
    "name" VARCHAR(90) NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "VoucherTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "status" "VoucherStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "tag_id" UUID NOT NULL,
    "usage_expired_time" TIMESTAMPTZ(3) NOT NULL,
    "sale_expired_time" TIMESTAMPTZ(3) NOT NULL,
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
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "voucher_img_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_term_condition_th" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "voucher_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "inactive_at" TIMESTAMPTZ(3),

    CONSTRAINT "voucher_term_condition_th_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_term_condition_en" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "voucher_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "inactive_at" TIMESTAMPTZ(3),

    CONSTRAINT "voucher_term_condition_en_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_usage_days" (
    "id" UUID NOT NULL,
    "usage_days" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "voucher_usage_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_promotion" (
    "id" UUID NOT NULL,
    "promotion_price" DECIMAL(8,2) NOT NULL,
    "voucher_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ(3) NOT NULL,
    "expired_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "voucher_promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_voucher" (
    "id" UUID NOT NULL,
    "quota_voucher_id" UUID NOT NULL,
    "package_price" DECIMAL(8,2) NOT NULL,
    "quota_amount" SMALLINT NOT NULL,
    "started_at" TIMESTAMPTZ(3) NOT NULL,
    "expired_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

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
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "package_img_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_reward_voucher" (
    "id" UUID NOT NULL,
    "reward_voucher_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "package_voucher_id" UUID NOT NULL,

    CONSTRAINT "package_reward_voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" UUID NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "voucher_usage_day_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "qrcode_img_path" TEXT NOT NULL,
    "redeemed_at" TIMESTAMPTZ(3),
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_voucher" (
    "id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "voucher_id" UUID NOT NULL,

    CONSTRAINT "order_item_voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_promotion" (
    "id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "voucher_promotion_id" UUID NOT NULL,

    CONSTRAINT "order_item_promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_package" (
    "id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "quotaVoucher" BOOLEAN NOT NULL,
    "voucher_id" UUID NOT NULL,

    CONSTRAINT "order_item_package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionSystem" (
    "id" UUID NOT NULL,
    "system" VARCHAR(90) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "TransactionSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "transaction_system_id" UUID NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Otp_account_email_key" ON "Otp"("account_email");

-- CreateIndex
CREATE UNIQUE INDEX "account_phone_key" ON "account"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_social_id_key" ON "account"("social_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_account_id_key" ON "session"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_voucher_order_item_id_key" ON "order_item_voucher"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_promotion_order_item_id_key" ON "order_item_promotion"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_package_order_item_id_key" ON "order_item_package"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionSystem_system_key" ON "TransactionSystem"("system");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherTag" ADD CONSTRAINT "VoucherTag_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "VoucherCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "VoucherTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_img" ADD CONSTRAINT "voucher_img_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_term_condition_th" ADD CONSTRAINT "voucher_term_condition_th_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_term_condition_en" ADD CONSTRAINT "voucher_term_condition_en_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_promotion" ADD CONSTRAINT "voucher_promotion_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_voucher" ADD CONSTRAINT "package_voucher_quota_voucher_id_fkey" FOREIGN KEY ("quota_voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_img" ADD CONSTRAINT "package_img_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_reward_voucher" ADD CONSTRAINT "package_reward_voucher_reward_voucher_id_fkey" FOREIGN KEY ("reward_voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_reward_voucher" ADD CONSTRAINT "package_reward_voucher_package_voucher_id_fkey" FOREIGN KEY ("package_voucher_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_voucher_usage_day_id_fkey" FOREIGN KEY ("voucher_usage_day_id") REFERENCES "voucher_usage_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_voucher" ADD CONSTRAINT "order_item_voucher_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_voucher" ADD CONSTRAINT "order_item_voucher_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_promotion" ADD CONSTRAINT "order_item_promotion_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_promotion" ADD CONSTRAINT "order_item_promotion_voucher_promotion_id_fkey" FOREIGN KEY ("voucher_promotion_id") REFERENCES "voucher_promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package" ADD CONSTRAINT "order_item_package_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package" ADD CONSTRAINT "order_item_package_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package_voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_package" ADD CONSTRAINT "order_item_package_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_transaction_system_id_fkey" FOREIGN KEY ("transaction_system_id") REFERENCES "TransactionSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
