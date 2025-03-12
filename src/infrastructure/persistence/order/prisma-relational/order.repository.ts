import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateOrderAndTransactionInput,
  CreateOrderItemPackageQuotaInfo,
  CreateOrderItemPackageRewardInfo,
  OrderRepository,
  UpdateStockAmountEachInfo,
  UpdateStockAmountInfo,
} from '../order.repository';
import { ErrorApiResponse } from 'src/common/core-api-response';
import {
  DiscountStatus,
  OrderItem,
  Prisma,
  TransactionStatus,
} from '@prisma/client';
import { OrderMapper } from './order.mapper';
import { NullAble } from '@utils/types/common.type';
import { generatePaginationQueryOption } from '@utils/prisma/service';
import {
  TransactionDomain,
  TransactionStatusEnum,
} from '@resources/transaction/domain/transaction.domain';
import { TimeAdderHelper } from '@utils/services/time-adder.helper';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { ObjectHelper } from '@utils/services/object.helper';
import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';
import { OrderItemRelationalPrismaORMStatic } from '../../order-item/prisma-relational/static-class/order-item-static.repository';
import {
  defaultPaginationOption,
  IPaginationOption,
} from 'src/common/types/pagination.type';

export class OrderRelationalPrismaORMRepository implements OrderRepository {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
  private defaultOrderItemLimitPaginationForFindMany: number = 1;
  private copyOrderItemIncludeQuery() {
    const copiedQuery = {
      ...OrderItemRelationalPrismaORMStatic.orderItemIncludeQuery,
    };
    delete copiedQuery.order;
    return copiedQuery;
  }

  private orderItemIncludeQuery: Prisma.OrderItemInclude =
    this.copyOrderItemIncludeQuery();

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
      include: this.orderItemIncludeQuery,
    },
    account: this.accountIncludeQuery,
  };

  private allDetailIncludeQuery({
    take,
    cursor,
    page,
  }: {
    take?: IPaginationOption['limit'] | 'ALL';
    cursor?: OrderItemDomain['id'];
    page?: IPaginationOption['page'];
  }): Prisma.OrderInclude {
    const paginationOption: Prisma.Order$OrderItemArgs = {};
    const defaultLimit = this.defaultOrderItemLimitPaginationForFindMany;
    let limit: number = defaultLimit;
    let isAll = false;

    // Process the 'take' option: accept a number > 0 or the string 'ALL'
    if (typeof take === 'string') {
      const takeUpper = take.toUpperCase();
      if (takeUpper === 'ALL') {
        isAll = true;
      } else {
        throw ErrorApiResponse.internalServerError(
          'Invalid pagination option for order-item.',
        );
      }
    } else if (typeof take === 'number') {
      if (take > 0) {
        limit = take;
      }
      // If take is a number but <= 0, we keep the default limit
    }

    const currentPage = page ?? defaultPaginationOption.page;

    if (cursor) {
      paginationOption.cursor = { id: cursor };
    } else {
      paginationOption.skip = (currentPage - 1) * limit;
    }

    // Only apply the 'take' (limit) if the special 'ALL' flag is not set
    if (!isAll) {
      paginationOption.take = limit;
    }

    console.log('Pagination options');

    const baseQuery: Prisma.OrderInclude = {
      OrderItem: {
        ...paginationOption,
        include: this.orderItemIncludeQuery,
      },
      Transaction: {
        include: {
          transactionSystem: true,
        },
      },
      account: this.accountIncludeQuery,
    };

    return baseQuery;
  }

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

          const createOrderItemProductPromise = [];

          if (orderItemsVoucherInfo.length > 0)
            createOrderItemProductPromise.push(
              tx.orderItemVoucher.createMany({
                data: orderItemsVoucherInfo,
              }),
            );

          if (
            !ObjectHelper.isObjectEmpty(orderItemsPackageInfo) &&
            orderItemsPackageInfo.quotas.length > 0 &&
            orderItemsPackageInfo.rewards.length > 0
          ) {
            createOrderItemProductPromise.push(
              ...this.generateCreateManyOrderItemPackage(
                orderItemsPackageInfo,
                tx,
              ),
            );
          }

          if (
            createOrderItemProductPromise.length === 0 ||
            createOrderItemProductPromise.every((item) => !item)
          )
            throw ErrorApiResponse.conflictRequest(
              'There is no detail for order item product to be created.',
            );

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
                  status: transaction.status,
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

          await Promise.all(updateStockTransactionPromise);

          // Wait for all promises to be resolved
          const orderAndTransaction = await createOrderPromise;
          await Promise.all(createOrderItemProductPromise);

          return tx.order.findUnique({
            where: {
              id: orderAndTransaction.id,
            },
            include: this.allDetailIncludeQuery({ take: 'ALL' }),
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

  private generateCreateManyOrderItemPackage(
    orderItemPackageInfo: CreateOrderAndTransactionInput['orderItemsPackageInfo'],
    txUnit: Prisma.TransactionClient,
  ): Promise<unknown>[] {
    const { quotas, rewards } = orderItemPackageInfo;
    if (quotas.length === 0 && rewards.length === 0) {
      return null;
    }

    const createManyQuota = txUnit.orderItemPackageQuota.createMany({
      data: this.processQuotaAndRewardData<CreateOrderItemPackageQuotaInfo>(
        quotas,
      ),
    });

    const createManyReward = txUnit.orderItemPackageReward.createMany({
      data: this.processQuotaAndRewardData<CreateOrderItemPackageRewardInfo>(
        rewards,
      ),
    });

    return [createManyQuota, createManyReward];
  }

  private processQuotaAndRewardData = <
    T extends
      | CreateOrderItemPackageQuotaInfo
      | CreateOrderItemPackageRewardInfo,
  >(
    items: T[],
  ) => {
    return items.map((item) => {
      const { discountId, ...rest } = item;

      if (discountId) return { ...rest, packageDiscountId: discountId };

      return rest;
    });
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
        ...this.transactionForUpdateVoucherStockAmount(
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
        ...this.transactionForUpdateVoucherStockAmount(
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

  async findByAccountId(
    accountId: OrderDomain['account']['id'],
    {
      cursor,
      paginationOptions,
    }: {
      cursor?: OrderDomain['id'];
      paginationOptions: IPaginationOption;
    },
  ): Promise<NullAble<OrderDomain[]>> {
    const paginateQuery = generatePaginationQueryOption<OrderDomain['id']>({
      paginationOption: paginationOptions,
    });
    const orders = await this.prismaService.order.findMany({
      ...paginateQuery,
      where: {
        accountId,
        deletedAt: {
          equals: null,
        },
      },
      include: this.allDetailIncludeQuery({
        cursor,
      }),
    });
    return orders.map(OrderMapper.toDomain);
  }

  async findById(
    id: string,
    { cursor, take }: { cursor?: OrderItemDomain['id']; take?: number },
  ): Promise<NullAble<OrderDomain>> {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: this.allDetailIncludeQuery({ cursor, take }),
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
                status: TransactionStatus.FAILED,
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
