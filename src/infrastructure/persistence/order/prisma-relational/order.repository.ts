import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateOrderAndTransactionInput,
  CreateOrderPackageIdList,
  CreateOrderPromotionIdList,
  CreateOrderVoucherIdList,
  OrderRepository,
  UpdateStockAmountEachInfo,
  UpdateStockAmountInfo,
} from '../order.repository';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { Prisma } from '@prisma/client';
import { AllOrderInformation, OrderMapper } from './order.mapper';
import { NullAble } from '@utils/types/common.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import { AccountMapper } from '../../account/prisma-relational/account.mapper';
import { RoleEnum } from '@resources/account/types/account.type';
import { TimeAdderHelper } from '@utils/services/time-adder.helper';

export class OrderRelationalPrismaORMRepository implements OrderRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  private defaultQrcodeImgPathToWaitForUpload: string = 'WAITFORUPLOAD';
  private defaultOrderItemLimitPaginationForFindMany: number = 1;

  private voucherCategoryIncludeQuery: Prisma.VoucherInclude = {
    voucherTag: {
      include: {
        voucherCategory: true,
      },
    },
  };

  private voucherImgIncludeQuery: Prisma.VoucherInclude = {
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

  private orderItemVoucherIncludeQuery: Prisma.OrderItemVoucherInclude = {
    voucher: {
      include: {
        ...this.voucherImgIncludeQuery,
        ...this.voucherCategoryIncludeQuery,
      },
    },
  };

  private orderItemPromotionIncludeQuery: Prisma.OrderItemPromotionInclude = {
    voucherPromotion: {
      include: {
        ...this.orderItemVoucherIncludeQuery,
      },
    },
  };

  private orderItemPackageIncludeQuery: Prisma.OrderItemPackageInclude = {
    package: {
      include: {
        PackageImg: {
          where: {
            mainImg: true,
          },
          select: {
            id: true,
            imgPath: true,
            mainImg: true,
          },
        },
        voucher: {
          include: {
            ...this.voucherCategoryIncludeQuery,
          },
        },
        PackageRewardVoucher: {
          include: {
            voucher: {
              include: {
                ...this.voucherCategoryIncludeQuery,
              },
            },
          },
        },
      },
    },
  };

  private orderItemAndUsableDaysIncludeQuery: Prisma.OrderInclude = {
    usableDaysAfterPurchased: {
      select: {
        id: true,
        usableDays: true,
      },
    },
    OrderItem: {
      include: {
        OrderItemVoucher: {
          include: {
            ...this.orderItemVoucherIncludeQuery,
          },
        },
        OrderItemPromotion: {
          include: {
            ...this.orderItemPromotionIncludeQuery,
          },
        },
        OrderItemPackage: {
          include: {
            ...this.orderItemPackageIncludeQuery,
          },
        },
      },
    },
    Transaction: {
      include: {
        transactionSystem: true,
      },
    },
  };

  private findManyIncludeQuery: Prisma.OrderInclude = {
    usableDaysAfterPurchased: {
      select: {
        id: true,
        usableDays: true,
      },
    },
    OrderItem: {
      take: this.defaultOrderItemLimitPaginationForFindMany,
      include: {
        OrderItemVoucher: {
          include: {
            ...this.orderItemVoucherIncludeQuery,
          },
        },
        OrderItemPromotion: {
          include: {
            ...this.orderItemPromotionIncludeQuery,
          },
        },
        OrderItemPackage: {
          include: {
            ...this.orderItemPackageIncludeQuery,
          },
        },
      },
    },
  };

  private nonDeleteWhereQuery: Prisma.OrderWhereInput = {
    deletedAt: {
      equals: null,
    },
  };

  /**
   * This method will create an order and related transaction,
   * and also update the stock amount of vouchers and packages,
   * and promotions.
   * @param {CreateOrderAndTransactionInput} createOrderAndTransactionInput
   * @returns {Promise<OrderAndTransactionType>}
   */
  public async createOrderAndTransaction({
    payload,
    accountId,
    usableDaysAfterPurchasedId,
    updateStockAmountInfo,
    voucherIdList,
    promotionIdList,
    packageIdList,
  }: CreateOrderAndTransactionInput): Promise<OrderDomain> {
    // Initialize the create order items
    // promise to provide in transaction
    try {
      const { vouchers, packages, promotions, allOrderItems } =
        this.generateOrderItemsQuery({
          voucherIdList,
          promotionIdList,
          packageIdList,
          orderId: payload.id,
        });
      // Find the transaction system
      const transactionSystem =
        await this.prismaService.transactionSystem.findFirst({
          where: {
            deletedAt: {
              equals: null,
            },
          },
        });

      const transactionExpireTime =
        await this.prismaService.transactionExpireTime.findFirst({
          where: {
            deletedAt: {
              equals: null,
            },
          },
        });

      if (!transactionSystem)
        throw ErrorApiResponse.conflictRequest('Transaction system not found.');

      // Create order and transaction,
      // and update the stock amount
      const orderAndTransaction = await this.prismaService.$transaction(
        async (tx) => {
          // Generate the update stock transaction promise
          const updateStockTransactionPromise =
            this.generateUpdateStockAmountTransactionPromise(
              tx,
              updateStockAmountInfo,
            );

          const currentDate = new Date(Date.now());
          const transactionExpiredAt = TimeAdderHelper.addTime(
            currentDate,
            transactionExpireTime.number,
            transactionExpireTime.unit,
          );
          // Create order and transaction
          const createOrderPromise = tx.order.create({
            data: {
              ...payload,
              usableDaysAfterPurchasedId,
              accountId,
              Transaction: {
                create: {
                  transactionSystemId: transactionSystem.id,
                  status: 'PENDING',
                  createdAt: currentDate,
                  expiredAt: transactionExpiredAt,
                },
              },
            },
            include: {
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
              usableDaysAfterPurchased: {
                select: {
                  id: true,
                  usableDays: true,
                },
              },
            },
          });

          // Wait for all promises to be resolved
          const [orderAndTransaction] = await Promise.all([
            createOrderPromise,
            ...updateStockTransactionPromise,
          ]);
          await tx.orderItem.createMany({
            data: allOrderItems,
          });
          await Promise.all([
            vouchers.length > 0
              ? tx.orderItemVoucher.createMany({ data: vouchers })
              : null,
            promotions.length > 0
              ? tx.orderItemPromotion.createMany({ data: promotions })
              : null,
            packages.quota.length > 0 && packages.rewards.length > 0
              ? tx.orderItemPackage.createMany({
                  data: [...packages.quota, ...packages.rewards],
                })
              : null,
          ]);

          return orderAndTransaction;
        },
      );

      if (
        !orderAndTransaction.Transaction ||
        Object.keys(orderAndTransaction.Transaction).length < 1
      ) {
        throw ErrorApiResponse.internalServerError(
          'Transaction could not be found after creating an order. Contact developer to fix this issue.',
        );
      }
      return OrderMapper.toDomain(orderAndTransaction);
    } catch (err) {
      throw ErrorApiResponse.internalServerError(err.message);
    }
  }

  private generateOrderItemsQuery = ({
    voucherIdList,
    promotionIdList,
    packageIdList,
    orderId,
  }: {
    voucherIdList?: CreateOrderVoucherIdList;
    promotionIdList?: CreateOrderPromotionIdList;
    packageIdList?: CreateOrderPackageIdList;
    orderId: OrderDomain['id'];
  }): {
    allOrderItems: Prisma.OrderItemCreateManyInput[];
    vouchers: Prisma.OrderItemVoucherCreateManyInput[];
    promotions: Prisma.OrderItemPromotionCreateManyInput[];
    packages: {
      quota: Prisma.OrderItemPackageCreateManyInput[];
      rewards: Prisma.OrderItemPackageCreateManyInput[];
    };
  } => {
    const allOrderItemData: Prisma.OrderItemCreateManyInput[] = [];
    const voucherItemsData: Prisma.OrderItemVoucherCreateManyInput[] = [];
    const promotionItemsData: Prisma.OrderItemPromotionCreateManyInput[] = [];
    const packageQuotaItemsData: Prisma.OrderItemPackageCreateManyInput[] = [];
    const packageRewardItemsData: Prisma.OrderItemPackageCreateManyInput[] = [];

    if (voucherIdList && voucherIdList.length > 0) {
      voucherIdList.forEach((item) => {
        allOrderItemData.push({
          id: item.id,
          code: item.code,
          qrcodeImgPath: this.defaultQrcodeImgPathToWaitForUpload,
          orderId,
        });

        voucherItemsData.push({
          orderItemId: item.id,
          voucherId: item.voucherId,
        });
      });
    }

    if (promotionIdList && promotionIdList.length > 0) {
      promotionIdList.forEach((item) => {
        allOrderItemData.push({
          id: item.id,
          code: item.code,
          qrcodeImgPath: this.defaultQrcodeImgPathToWaitForUpload,
          orderId,
        });

        promotionItemsData.push({
          orderItemId: item.id,
          voucherPromotionId: item.promotionId,
        });
      });
    }

    if (
      packageIdList &&
      packageIdList.quotaList.length > 0 &&
      packageIdList.rewardList.length > 0
    ) {
      packageIdList.quotaList.forEach((item) => {
        allOrderItemData.push({
          id: item.id,
          code: item.code,
          qrcodeImgPath: this.defaultQrcodeImgPathToWaitForUpload,
          orderId,
        });
        packageQuotaItemsData.push({
          orderItemId: item.id,
          rewardVoucher: false,
          packageId: item.packageId,
          voucherId: item.voucherId,
        });
      });

      packageIdList.rewardList.forEach((item) => {
        allOrderItemData.push({
          id: item.id,
          code: item.code,
          qrcodeImgPath: this.defaultQrcodeImgPathToWaitForUpload,
          orderId,
        });

        packageRewardItemsData.push({
          orderItemId: item.id,
          packageId: item.packageId,
          rewardVoucher: true,
          voucherId: item.voucherId,
        });
      });
    }

    return {
      allOrderItems: allOrderItemData,
      vouchers: voucherItemsData,
      promotions: promotionItemsData,
      packages: {
        quota: packageQuotaItemsData,
        rewards: packageRewardItemsData,
      },
    };
  };

  private generateUpdateStockAmountTransactionPromise(
    tx: Prisma.TransactionClient,
    updateStockAmountInfo: UpdateStockAmountInfo,
  ): Promise<unknown>[] {
    const transactionForUpdateStockAmountPromiseArr = [];
    if (
      updateStockAmountInfo.vouchers &&
      updateStockAmountInfo.vouchers.length > 0
    ) {
      transactionForUpdateStockAmountPromiseArr.push(
        this.transactionForUpdateVoucherStockAmount(
          tx,
          updateStockAmountInfo.vouchers,
          'voucher',
        ),
      );
    }

    if (
      updateStockAmountInfo.promotions &&
      updateStockAmountInfo.promotions.length > 0
    ) {
      transactionForUpdateStockAmountPromiseArr.push(
        this.transactionForUpdateVoucherStockAmount(
          tx,
          updateStockAmountInfo.promotions,
          'promotion',
        ),
      );
    }

    if (
      updateStockAmountInfo.packages &&
      updateStockAmountInfo.packages.length > 0
    ) {
      transactionForUpdateStockAmountPromiseArr.push(
        this.transactionForUpdateVoucherStockAmount(
          tx,
          updateStockAmountInfo.packages,
          'package',
        ),
      );
    }

    return transactionForUpdateStockAmountPromiseArr;
  }

  private transactionForUpdateVoucherStockAmount(
    tx: Prisma.TransactionClient,
    data: UpdateStockAmountEachInfo[],
    type: 'voucher' | 'promotion' | 'package',
  ): Promise<unknown>[] {
    switch (type) {
      case 'voucher':
        return data.map(async (item) => {
          return tx.voucher.update({
            where: { id: item.id },
            data: {
              stockAmount: item.updatedStockAmount,
            },
          });
        });
      case 'promotion':
        return data.map(async (item) => {
          return tx.voucherPromotion.update({
            where: { id: item.id },
            data: { stockAmount: item.updatedStockAmount },
          });
        });
      case 'package':
        return data.map(async (item) => {
          return tx.packageVoucher.update({
            where: { id: item.id },
            data: { stockAmount: item.updatedStockAmount },
          });
        });
      default:
        throw ErrorApiResponse.conflictRequest();
    }
  }

  // --------------------- CREATE PART ENDED --------------------------//

  async findById(id: string): Promise<NullAble<OrderDomain>> {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: {
        ...this.orderItemAndUsableDaysIncludeQuery,
      },
    });
    const findedAccount = await this.prismaService.account.findUnique({
      where: { id: order.accountId },
    });
    const account = AccountMapper.toDomain(findedAccount, RoleEnum.Me);

    return OrderMapper.toDomain({ ...order, account });
  }

  async findMany({
    cursor,
    transactionStatus,
  }: {
    cursor?: OrderDomain['id'];
    transactionStatus?: TransactionDomain['status'];
  }): Promise<OrderDomain[]> {
    const paginationQuery = generatePaginationQueryOption({ cursor });
    const queryTransactionStatus = transactionStatus ?? 'SUCCESS';
    const ordersList = await this.prismaService.order.findMany({
      ...paginationQuery,
      where: {
        Transaction: {
          status: {
            equals: queryTransactionStatus,
          },
        },
        ...this.nonDeleteWhereQuery,
      },
      include: {
        ...this.findManyIncludeQuery,
      },
    });

    const accountList = await this.prismaService.account.findMany({
      where: {
        id: {
          in: ordersList.map((item) => item.accountId),
        },
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
      },
    });

    const accountMap = new Map<string, (typeof accountList)[number]>();
    accountList.forEach((account) => accountMap.set(account.id, account));

    const allOrdersInfo: AllOrderInformation[] = ordersList.map((order) => {
      const matchedAccount = accountMap.get(order.accountId);
      if (!matchedAccount)
        throw ErrorApiResponse.conflictRequest(
          `The order ID: ${order.id} does not have matching account. Please contact developer to fix the issue.`,
        );
      return { ...order, account: matchedAccount };
    });

    return allOrdersInfo.map(OrderMapper.toDomain);
  }

  async deleteManyOrderWithUnsuccessTransaction(
    orderIdList: OrderDomain['id'][],
    transactionIdList: TransactionDomain['id'][],
  ): Promise<void> {
    try {
      const currentDate = new Date(Date.now());
      await this.prismaService.$transaction(async (tx) => {
        return Promise.all([
          ...orderIdList.map((orderId) => {
            return tx.order.update({
              where: { id: orderId },
              data: {
                deletedAt: currentDate,
              },
            });
          }),
          ...transactionIdList.map((transactionId) => {
            return tx.transaction.update({
              where: { id: transactionId },
              data: {
                status: 'FAILED',
                deletedAt: currentDate,
              },
            });
          }),
        ]);
      });
    } catch (err) {
      throw new Error(err);
    }
  }
}
