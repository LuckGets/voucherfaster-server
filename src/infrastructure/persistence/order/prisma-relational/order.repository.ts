import { Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateOrderAndTransactionInput,
  CreateOrderPackageIdList,
  CreateOrderPromotionIdList,
  CreateOrderVoucherIdList,
  OrderAndTransactionType,
  OrderRepository,
} from '../order.repository';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { Prisma } from '@prisma/client';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';

export class OrderRelationalPrismaORMRepository implements OrderRepository {
  private defaultQrcodeImgPathToWaitForUpload: string = 'WAITFORUPLOAD';
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  async createOrderAndTransaction({
    payload,
    accountId,
    voucherUsageDayId,
    voucherIdList,
    promotionIdList,
    packageIdList,
  }: CreateOrderAndTransactionInput): Promise<OrderAndTransactionType> {
    // Initialize the create order items
    // promise to provide in transaction
    try {
      const { createManyOrderItemQuery } = this.generateOrderItemsQuery({
        voucherIdList,
        promotionIdList,
        packageIdList,
      });

      const transactionSystem =
        await this.prismaService.transactionSystem.findFirst({
          where: {
            deletedAt: {
              equals: null,
            },
          },
        });

      const { order, transaction } = await this.prismaService.$transaction(
        async (tx) => {
          const order = await this.prismaService.order.create({
            data: {
              ...payload,
              voucherUsageDayId,
              accountId,
              OrderItem: createManyOrderItemQuery,
              Transaction: {
                create: {
                  transactionSystemId: transactionSystem.id,
                  status: 'PENDING',
                },
              },
            },
          });
        },
      );
    } catch (err) {
      throw ErrorApiResponse.internalServerError(err.message);
    }
  }

  generateOrderItemsQuery = ({
    voucherIdList,
    promotionIdList,
    packageIdList,
  }: {
    voucherIdList?: CreateOrderVoucherIdList;
    promotionIdList?: CreateOrderPromotionIdList;
    packageIdList?: CreateOrderPackageIdList;
  }): {
    createManyOrderItemQuery: Prisma.OrderItemCreateNestedManyWithoutOrderInput;
  } => {
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
    return { createManyOrderItemQuery };
  };
}
