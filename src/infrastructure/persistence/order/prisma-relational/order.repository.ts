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
import { OrderMapper } from './order.mapper';
import { NullAble } from '@utils/types/common.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';

export class OrderRelationalPrismaORMRepository implements OrderRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  private defaultQrcodeImgPathToWaitForUpload: string = 'WAITFORUPLOAD';

  private orderItemVoucherIncludeQuery: Prisma.OrderItemVoucherInclude = {
    voucher: {
      include: {
        VoucherImg: {
          where: {
            mainImg: true,
          },
        },
      },
    },
  };

  private orderItemPromotionIncludeQuery: Prisma.OrderItemPromotionInclude = {
    voucherPromotion: {
      include: {
        voucher: {
          include: {
            VoucherImg: {
              where: {
                mainImg: true,
              },
            },
          },
        },
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
        },
        PackageRewardVoucher: {
          include: {
            voucher: true,
          },
        },
      },
    },
  };

  private includeQuery: Prisma.OrderInclude = {
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
      const createManyOrderItemQuery = this.generateOrderItemsQuery({
        voucherIdList,
        promotionIdList,
        packageIdList,
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

          // Create order and transaction
          const createOrderPromise = this.prismaService.order.create({
            data: {
              ...payload,
              usableDaysAfterPurchasedId,
              accountId,
              OrderItem: createManyOrderItemQuery,
              Transaction: {
                create: {
                  transactionSystemId: transactionSystem.id,
                  status: 'PENDING',
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
  }: {
    voucherIdList?: CreateOrderVoucherIdList;
    promotionIdList?: CreateOrderPromotionIdList;
    packageIdList?: CreateOrderPackageIdList;
  }): Prisma.OrderItemCreateNestedManyWithoutOrderInput => {
    const createManyOrderItemQuery: Prisma.OrderItemCreateNestedManyWithoutOrderInput =
      {
        create: [],
      };

    const queryForCreateArr: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    if (voucherIdList && voucherIdList.length > 0) {
      voucherIdList.forEach((item) => {
        const query: Prisma.OrderItemCreateWithoutOrderInput = {
          id: item.id,
          qrcodeImgPath: this.defaultQrcodeImgPathToWaitForUpload,
          code: item.code,
          OrderItemVoucher: {
            create: {
              voucherId: item.voucherId,
            },
          },
        };
        queryForCreateArr.push(query);
      });
    }

    if (promotionIdList && promotionIdList.length > 0) {
      promotionIdList.forEach((item) => {
        const query: Prisma.OrderItemCreateWithoutOrderInput = {
          id: item.id,
          qrcodeImgPath: this.defaultQrcodeImgPathToWaitForUpload,
          code: item.code,
          OrderItemPromotion: {
            create: {
              voucherPromotionId: item.promotionId,
            },
          },
        };
        queryForCreateArr.push(query);
      });
    }

    if (
      packageIdList &&
      packageIdList.quotaList.length > 0 &&
      packageIdList.rewardList.length > 0
    ) {
      packageIdList.quotaList.forEach((item) => {
        const query: Prisma.OrderItemCreateWithoutOrderInput = {
          id: item.id,
          qrcodeImgPath: this.defaultQrcodeImgPathToWaitForUpload,
          code: item.code,
          OrderItemPackage: {
            create: {
              packageId: item.packageId,
              voucherId: item.voucherId,
              rewardVoucher: false,
            },
          },
        };
        queryForCreateArr.push(query);
      });

      packageIdList.rewardList.forEach((item) => {
        const query: Prisma.OrderItemCreateWithoutOrderInput = {
          id: item.id,
          qrcodeImgPath: this.defaultQrcodeImgPathToWaitForUpload,
          code: item.code,
          OrderItemPackage: {
            create: {
              packageId: item.packageId,
              voucherId: item.voucherId,
              rewardVoucher: true,
            },
          },
        };
        queryForCreateArr.push(query);
      });
    }

    createManyOrderItemQuery.create = queryForCreateArr;
    return createManyOrderItemQuery;
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

  async findById(id: string): Promise<NullAble<OrderDomain>> {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: {
        ...this.includeQuery,
      },
    });
    return OrderMapper.toDomain(order);
  }

  async findMany({
    cursor,
  }: {
    cursor?: OrderDomain['id'];
  }): Promise<OrderDomain[]> {
    const paginationQuery = generatePaginationQueryOption({ cursor });

    const ordersList = await this.prismaService.order.findMany({
      ...paginationQuery,
      include: {
        ...this.includeQuery,
      },
    });

    return ordersList.map(OrderMapper.toDomain);
  }
}
