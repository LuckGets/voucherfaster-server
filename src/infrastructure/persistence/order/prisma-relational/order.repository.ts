import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateOrderAndTransactionInput,
  OrderRepository,
  UpdateStockAmountEachInfo,
  UpdateStockAmountInfo,
} from '../order.repository';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { DiscountStatus, Prisma } from '@prisma/client';
import { OrderMapper } from './order.mapper';
import { NullAble } from '@utils/types/common.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import {
  TransactionDomain,
  TransactionStatusEnum,
} from '@resources/transaction/domain/transaction.domain';
import { TimeAdderHelper } from '@utils/services/time-adder.helper';
import { OrderDomain } from '@resources/order/domain/order.domain';

export class OrderRelationalPrismaORMRepository implements OrderRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  private defaultOrderItemLimitPaginationForFindMany: number = 1;

  private voucherDiscountIncludeQuery: Prisma.VoucherInclude = {
    VoucherDiscount: true,
  };

  private voucherCategoryIncludeQuery: Prisma.VoucherInclude = {
    voucherTag: {
      include: {
        category: true,
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
        ...this.voucherDiscountIncludeQuery,
        ...this.voucherImgIncludeQuery,
        ...this.voucherCategoryIncludeQuery,
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
        PackageDiscount: true,
        voucher: {
          include: this.voucherCategoryIncludeQuery,
        },
        PackageRewardVoucher: {
          include: {
            voucher: {
              include: this.voucherCategoryIncludeQuery,
            },
          },
        },
      },
    },
  };

  private accountIncludeQuery: Prisma.AccountDefaultArgs = {
    select: {
      id: true,
      role: true,
      email: true,
      fullname: true,
      phone: true,
      verifiedAt: true,
    },
  };

  private findManyIncludeQuery: Prisma.OrderInclude = {
    OrderItem: {
      take: this.defaultOrderItemLimitPaginationForFindMany,
      include: {
        OrderItemVoucher: {
          include: this.orderItemVoucherIncludeQuery,
        },
        OrderItemPackage: {
          include: this.orderItemPackageIncludeQuery,
        },
      },
    },
    account: this.accountIncludeQuery,
  };

  private allDetailIncludeQuery: Prisma.OrderInclude = {
    OrderItem: {
      include: {
        OrderItemVoucher: {
          include: this.orderItemVoucherIncludeQuery,
        },
        OrderItemPackage: {
          include: this.orderItemPackageIncludeQuery,
        },
      },
    },
    Transaction: {
      include: {
        transactionSystem: true,
      },
    },
    account: this.accountIncludeQuery,
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
    updateStockAmountInfo,
    allOrderItemsInfo,
    transaction,
    orderItemsVoucherInfo,
    orderItemsPackageInfo,
  }: CreateOrderAndTransactionInput): Promise<OrderDomain> {
    // Initialize the create order items
    // promise to provide in transaction
    try {
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

          const createOrderItemProductPromise = [
            orderItemsVoucherInfo.length > 0
              ? tx.orderItemVoucher.createMany({ data: orderItemsVoucherInfo })
              : null,
            orderItemsVoucherInfo.length > 0
              ? tx.orderItemPackage.createMany({
                  data: orderItemsPackageInfo.map((item) => ({
                    ...item,
                    rewardVoucher: item.reward,
                  })),
                })
              : null,
          ];
          const currentDate = new Date(Date.now());
          const transactionExpiredAt = TimeAdderHelper.addTime(
            currentDate,
            transactionExpireTime.number,
            transactionExpireTime.unit,
          );

          const createOrderPromise = tx.order.create({
            data: {
              ...payload,
              accountId,
              Transaction: {
                create: {
                  id: transaction.id,
                  transactionSystemId: transactionSystem.id,
                  status: TransactionStatusEnum.PENDING,
                  createdAt: currentDate,
                  expiredAt: transactionExpiredAt,
                },
              },
              OrderItem: {
                createMany: {
                  data: allOrderItemsInfo,
                },
              },
            },
          });

          // Wait for all promises to be resolved
          const [orderAndTransaction] = await Promise.all([
            createOrderPromise,
            ...updateStockTransactionPromise,
          ]);
          await Promise.all(createOrderItemProductPromise);

          return tx.order.findUnique({
            where: {
              id: orderAndTransaction.id,
            },
            include: this.allDetailIncludeQuery,
          });
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
      console.error(err);
      throw ErrorApiResponse.internalServerError(err.message);
    }
  }

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
      include: this.allDetailIncludeQuery,
    });
    if (!order) return null;

    return OrderMapper.toDomain(order);
  }

  async findMany({
    cursor,
    transactionStatus,
  }: {
    cursor?: OrderDomain['id'];
    transactionStatus?: TransactionDomain['status'];
  }): Promise<OrderDomain[]> {
    const paginationQuery = generatePaginationQueryOption({ cursor });
    const queryTransactionStatus =
      TransactionStatusEnum[transactionStatus.toUpperCase()] ??
      TransactionStatusEnum.SUCCESS;
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
      include: this.findManyIncludeQuery,
    });

    return ordersList.map(OrderMapper.toDomain);
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
