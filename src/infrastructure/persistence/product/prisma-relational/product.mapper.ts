import {
  Category,
  PackageDiscount,
  PackageQuotaVoucher,
  PackageVoucher,
  Voucher,
  VoucherDiscount,
  VoucherTag,
} from '@prisma/client';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import {
  ProductDiscountDomain,
  ProductDiscountStatusEnum,
  ProductDomain,
  ProductDomainList,
  ProductImgDomain,
  ProductStatusEnum,
} from '@resources/product/domain/product.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';

type VoucherOrPackagePrismaType = Voucher | PackageVoucher;
type VoucherOrPackageDiscountPrismaType = VoucherDiscount | PackageDiscount;

export type ProductRawSql = {
  id: VoucherOrPackagePrismaType['id'];
  title: VoucherOrPackagePrismaType['title'];
  description: VoucherOrPackagePrismaType['description'];
  price: VoucherOrPackagePrismaType['price'];
  status: VoucherOrPackagePrismaType['status'];
  stock_amount: VoucherOrPackagePrismaType['stockAmount'];
  usable_at: VoucherOrPackagePrismaType['usableAt'];
  usable_expired_at: VoucherOrPackagePrismaType['usableExpiredAt'];
  sell_started_at: VoucherOrPackagePrismaType['sellStartedAt'];
  sell_expired_at: VoucherOrPackagePrismaType['sellExpiredAt'];
  created_at: VoucherOrPackagePrismaType['createdAt'];
  updated_at: VoucherOrPackagePrismaType['updatedAt'];
  image_id: ProductImgDomain['id'];
  img_path: ProductImgDomain['imgPath'];
  main_img: ProductImgDomain['mainImg'];
  discount_id?: VoucherOrPackageDiscountPrismaType['id'];
  discounted_price?: VoucherOrPackageDiscountPrismaType['discountedPrice'];
  discount_status?: VoucherOrPackageDiscountPrismaType['status'];
  category_name: Category['name'];
  tag_name: VoucherTag['name'];
  package_quota_voucher_id?: PackageQuotaVoucher['id'];
  quota_voucher_id?: PackageQuotaVoucher['quotaVoucherId'];
  quota_amount?: PackageQuotaVoucher['amount'];
};

export type ProductTotalCountType = Array<{ [ProductCountRowName]: bigint }>;

export const ProductCountRowName = 'total_count';

export class ProductMapper {
  public static toDomainFromRawSql(rawSqlEntity: ProductRawSql): ProductDomain {
    const {
      id,
      title,
      description,
      price,
      status,
      category_name,
      created_at,
      image_id,
      tag_name,
      img_path,
      main_img,
      sell_expired_at,
      sell_started_at,
      stock_amount,
      updated_at,
      usable_at,
      usable_expired_at,
      discount_id,
      discount_status,
      discounted_price,
    } = rawSqlEntity;

    let discount: ProductDiscountDomain;
    if (discount_id && discounted_price && discount_status) {
      discount = new ProductDiscountDomain({
        id: discount_id,
        discountedPrice: discounted_price.toNumber(),
        status: ProductDiscountStatusEnum[discount_status],
      });
    }

    const images: ProductImgDomain[] = [
      new ProductImgDomain({
        id: image_id,
        imgPath: img_path,
        mainImg: main_img,
      }),
    ];

    const product: ProductDomain = {
      id,
      category: category_name,
      description,
      images,
      price: price.toNumber(),
      sellExpiredAt: sell_expired_at,
      sellStartedAt: sell_started_at,
      stockAmount: stock_amount,
      title,
      usableAt: usable_at,
      usableExpiredAt: usable_expired_at,
      createdAt: created_at,
      updatedAt: updated_at,
      status: ProductStatusEnum[status],
      tag: tag_name,
    };

    if (discount) product.discount = discount;

    if (rawSqlEntity.quota_voucher_id && rawSqlEntity.quota_amount) {
      const { package_quota_voucher_id, quota_voucher_id, quota_amount } =
        rawSqlEntity;

      return new PackageVoucherDomain({
        ...product,
        quotaVouchers: [
          {
            id: package_quota_voucher_id,
            amount: quota_amount,
            voucherId: quota_voucher_id,
          },
        ],
      });
    }

    return new VoucherDomain(product);
  }

  public static toDomainListFromRawSqlList(
    rawSqlList: ProductRawSql[],
    totalCount: ProductTotalCountType,
  ): ProductDomainList {
    return {
      products: rawSqlList.map((item) =>
        ProductMapper.toDomainFromRawSql(item),
      ),
      totalCount: Number(totalCount[0][ProductCountRowName]),
    };
  }
}
