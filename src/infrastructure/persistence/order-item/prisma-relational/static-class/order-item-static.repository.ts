import { Prisma } from '@prisma/client';

export class OrderItemRelationalPrismaORMStatic {
  public static packageDiscountIncludeQuery: Prisma.PackageDiscountSelect = {
    id: true,
    discountedPrice: true,
    status: true,
    deletedAt: true,
  };

  public static packageAndImgIncludeQuery: Prisma.PackageVoucherInclude = {
    PackageImg: {
      select: {
        id: true,
        mainImg: true,
        imgPath: true,
      },
      where: {
        mainImg: true,
      },
    },
  };

  public static voucherImgIncludeQuery: Prisma.VoucherInclude = {
    VoucherImg: {
      where: {
        mainImg: true,
      },
      select: {
        id: true,
        imgPath: true,
        mainImg: true,
      },
    },
  };

  public static voucherCategoryIncludeQuery: Prisma.VoucherInclude = {
    voucherTag: {
      include: {
        category: true,
      },
    },
  };

  public static orderIncludeQuery: Prisma.OrderInclude = {
    Transaction: {
      include: {
        transactionSystem: {
          select: {
            id: true,
            system: true,
          },
        },
      },
    },
    account: {
      select: {
        id: true,
        role: true,
        email: true,
        fullname: true,
        phone: true,
        verifiedAt: true,
      },
    },
  };

  public static orderItemVoucherIncludeQuery: Prisma.OrderItemVoucherInclude = {
    voucher: {
      include: {
        ...this.voucherImgIncludeQuery,
        ...this.voucherCategoryIncludeQuery,
      },
    },
    VoucherDiscount: true,
  };

  public static orderItemPackageQuotaIncludeQuery: Prisma.OrderItemPackageQuotaInclude =
    {
      PackageDiscount: {
        select: this.packageDiscountIncludeQuery,
      },
      packageQuotaVoucher: {
        include: {
          package: {
            include: {
              PackageImg: {
                select: {
                  id: true,
                  mainImg: true,
                  imgPath: true,
                },
                where: {
                  mainImg: true,
                },
              },
            },
          },
          voucher: {
            include: this.voucherCategoryIncludeQuery,
          },
        },
      },
    };

  public static orderItemPackageRewardIncludeQuery: Prisma.OrderItemPackageRewardInclude =
    {
      PackageDiscount: {
        select: this.packageDiscountIncludeQuery,
      },
      packageRewardVoucher: {
        include: {
          package: {
            include: {
              PackageImg: {
                select: {
                  id: true,
                  mainImg: true,
                  imgPath: true,
                },
                where: {
                  mainImg: true,
                },
              },
            },
          },
          voucher: {
            include: {
              ...this.voucherImgIncludeQuery,
              ...this.voucherCategoryIncludeQuery,
            },
          },
        },
      },
    };

  public static orderItemIncludeQuery: Prisma.OrderItemInclude = {
    OrderItemPackageQuota: {
      include: this.orderItemPackageQuotaIncludeQuery,
    },
    OrderItemPackageReward: {
      include: this.orderItemPackageRewardIncludeQuery,
    },
    OrderItemVoucher: {
      include: this.orderItemVoucherIncludeQuery,
    },
    order: {
      include: this.orderIncludeQuery,
    },
    RedeemOrderItem: {
      where: {
        deletedAt: {
          equals: null,
        },
      },
      select: {
        id: true,
        updatedAt: true,
      },
    },
  };
}
