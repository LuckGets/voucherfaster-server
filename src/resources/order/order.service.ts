import { Injectable } from '@nestjs/common';
import {
  CreateOrderAndTransactionInput,
  OrderRepository,
  UpdateStockAmountInfo,
} from 'src/infrastructure/persistence/order/order.repository';
import { CreateOrderDto, CreateOrderItem } from './dto/create-order.dto';
import { OrderDomain } from './domain/order.domain';
import { AccountDomain } from '@resources/account/domain/account.domain';
import { VoucherService } from '@resources/voucher/voucher.service';
import { PackageVoucherService } from '@resources/package/package.service';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { UUIDService } from '@utils/services/uuid.service';
import { OrderItemDomain } from './domain/order-item.domain';
import { UsableDaysService } from '@resources/usable-days/usable-days.service';
import { TransactionService } from '@resources/transaction/transaction.service';

export type OrderItemsInfo = {
  vouchers: VoucherDomain[];
  promotions: VoucherPromotionDomain[];
  packages: PackageVoucherDomain[];
};

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private voucherService: VoucherService,
    private packageVoucherService: PackageVoucherService,
    private usableDaysService: UsableDaysService,
    private transactionService: TransactionService,
    private uuidService: UUIDService,
  ) {}

  // --------------------------------------------------------------------------//
  // --------------------------------------------------------------------------//
  // ------------------------------- CREATING ORDER PART ----------------------//
  // --------------------------------------------------------------------------//
  // --------------------------------------------------------------------------//

  async createOrder(
    data: CreateOrderDto,
    accountId: AccountDomain['id'],
  ): Promise<OrderDomain> {
    const { paymentToken, ...restData } = data;
    const { items, totalPrice, updateStockAmountInfo } =
      await this.findOrderItemInfoAndTotalPriceAndCheckingStock(restData);

    const { createOrderData, allOrderItemsId } =
      await this.prepareCreateOrderData({
        accountId,
        items,
        totalPrice,
        updateStockAmountInfo,
      });

    const order =
      await this.orderRepository.createOrderAndTransaction(createOrderData);

    const transaction = await this.transactionService.processPayment({
      token: paymentToken,
      amount: totalPrice,
      description: `OrderId:${order.id} | TransactionId:${order.transaction.id}`,
      transactionId: order.transaction.id,
    });
  }

  // Not promise.all but solid
  //   async findOrderItemInformation(data: CreateOrderDto): Promise<{
  //     items: OrderItemsInfo;
  //     totalPrice: number;
  //   }> {
  //     let totalPrice: number = 0;
  //     const allItemsInfo: OrderItemsInfo = {
  //       vouchers: [],
  //       promotions: [],
  //       packages: [],
  //     };
  //     try {
  //       for (const item of data.items) {
  //         switch (item.voucherType) {
  //           case 'voucher': {
  //             const voucher = await this.voucherService.getVoucherById(item.id);
  //             totalPrice += voucher.price;
  //             allItemsInfo.vouchers.push(voucher);
  //             break;
  //           }
  //           case 'promotion': {
  //             const promotion = await this.voucherService.getVoucherPromotionById(
  //               item.id,
  //             );
  //             totalPrice += promotion.promotionPrice;
  //             allItemsInfo.promotions.push(promotion);
  //             break;
  //           }
  //           case 'package': {
  //             const packageVoucher =
  //               await this.packageVoucherService.getPackageVoucherById(item.id);
  //             totalPrice += packageVoucher.price;
  //             allItemsInfo.packages.push(packageVoucher);
  //             break;
  //           }
  //           default:
  //             throw new Error(`Unknown voucher type: ${item.voucherType}`);
  //         }
  //       }

  //       return { items: allItemsInfo, totalPrice };
  //     } catch (err) {
  //       throw new Error(`Failed to process order items: ${err.message}`);
  //     }
  //   }
  // }

  // promise.all but untested.
  // There are going to have the
  // race condition in total price
  // but since it does not have to lock
  // or sequential
  // So, I guess it would be better if just using
  // power of worker
  private async findOrderItemInfoAndTotalPriceAndCheckingStock(
    data: Omit<CreateOrderDto, 'paymentToken'>,
  ): Promise<{
    items: OrderItemsInfo;
    totalPrice: number;
    updateStockAmountInfo: UpdateStockAmountInfo;
  }> {
    const allItemsInfo: OrderItemsInfo = {
      vouchers: [],
      promotions: [],
      packages: [],
    };

    const updateStockAmountInfo: UpdateStockAmountInfo = {
      vouchers: [],
      promotions: [],
      packages: [],
    };

    const allItemsInfoPromisesArr = data.items.map(async (item) => {
      let itemPrice = 0;

      switch (item.voucherType) {
        case 'voucher': {
          const voucher = await this.checkVoucherOrderItemInfo(item);
          itemPrice += voucher.price;
          allItemsInfo.vouchers.push(voucher);
          updateStockAmountInfo.vouchers.push({
            id: voucher.id,
            updatedStockAmount: voucher.stockAmount - item.amount,
          });
          break;
        }
        case 'promotion': {
          const promotion = await this.checkVoucherPromotionOrderItemInfo(item);
          itemPrice += promotion.promotionPrice;
          allItemsInfo.promotions.push(promotion);
          updateStockAmountInfo.promotions.push({
            id: promotion.id,
            updatedStockAmount: promotion.stockAmount - item.amount,
          });
          break;
        }
        case 'package': {
          const packageVoucher = await this.checkPackageOrderItemInfo(item);
          itemPrice += packageVoucher.price;
          allItemsInfo.packages.push(packageVoucher);
          updateStockAmountInfo.packages.push({
            id: packageVoucher.id,
            updatedStockAmount: packageVoucher.stockAmount - item.amount,
          });
          break;
        }
        default:
          throw new Error(`Unknown voucher type: ${item.voucherType}`);
      }

      return itemPrice;
    });

    try {
      const allItemPricesArr = await Promise.all(allItemsInfoPromisesArr);
      const totalPrice = allItemPricesArr.reduce(
        (sum, price) => sum + price,
        0,
      );
      if (data.totalPrice !== totalPrice)
        throw ErrorApiResponse.conflictRequest(
          `The total price of all items: ${totalPrice} does not match with provided total price: ${data.totalPrice}`,
        );
      return { items: allItemsInfo, totalPrice, updateStockAmountInfo };
    } catch (error) {
      throw new Error(`Error processing order items: ${error.message}`);
    }
  }

  private async checkVoucherOrderItemInfo(
    orderItem: CreateOrderItem,
  ): Promise<VoucherDomain> {
    const voucher = await this.voucherService.getVoucherById(orderItem.id);
    if (!voucher) throw new Error(`Voucher with ID ${orderItem.id} not found.`);
    if (voucher.stockAmount === 0)
      throw ErrorApiResponse.conflictRequest(
        `The voucher ID:${voucher.id} is now out of stock.`,
      );

    if (voucher.stockAmount < orderItem.amount)
      throw ErrorApiResponse.conflictRequest(
        `The voucher ID:${voucher.id} only have ${voucher.stockAmount} which not enough for making order.`,
      );
    return voucher;
  }

  private async checkVoucherPromotionOrderItemInfo(
    orderItem: CreateOrderItem,
  ): Promise<VoucherPromotionDomain> {
    const promotion = await this.voucherService.getVoucherPromotionById(
      orderItem.id,
    );
    if (!promotion)
      throw new Error(`Promotion with ID ${orderItem.id} not found.`);
    if (promotion.stockAmount === 0)
      throw ErrorApiResponse.conflictRequest(
        `The promotion ID:${promotion.id} is now out of stock.`,
      );
    if (promotion.stockAmount < orderItem.amount)
      throw ErrorApiResponse.conflictRequest(
        `The promotion ID:${promotion.id} only have ${promotion.stockAmount} which not enough for making order.`,
      );
    return promotion;
  }

  private async checkPackageOrderItemInfo(
    orderItem: CreateOrderItem,
  ): Promise<PackageVoucherDomain> {
    const packageVoucher =
      await this.packageVoucherService.getPackageVoucherById(orderItem.id);
    if (!packageVoucher)
      throw new Error(`Package Voucher with ID ${orderItem.id} not found.`);
    if (packageVoucher.stockAmount === 0)
      throw ErrorApiResponse.conflictRequest(
        `The package ID:${packageVoucher.id} is now out of stock.`,
      );
    if (packageVoucher.stockAmount < orderItem.amount)
      throw ErrorApiResponse.conflictRequest(
        `The package ID:${packageVoucher.id} only have ${packageVoucher.stockAmount} which not enough for making order.`,
      );
    return packageVoucher;
  }

  /**
   * Prepare the create order data from the result of the order items checking process.
   * This function will create a new order item for each voucher, promotion and package
   * and return the order items id and the create order input data.
   * @param {object} data - The input data for creating order.
   * @property {object[]} data.items - The items that user want to order.
   * @property {string} data.accountId - The account id of the user who makes the order.
   * @property {number} data.totalPrice - The total price of the order.
   * @property {object} data.updateStockAmountInfo - The information for updating stock amount of voucher, promotion and package.
   * @returns {Promise<{createOrderData: CreateOrderAndTransactionInput, allOrderItemsId: string[]}>} - The create order data and the order items id.
   */
  private async prepareCreateOrderData({
    items,
    accountId,
    totalPrice,
    updateStockAmountInfo,
  }: {
    items: OrderItemsInfo;
    accountId: AccountDomain['id'];
    totalPrice: number;
    updateStockAmountInfo: UpdateStockAmountInfo;
  }): Promise<{
    createOrderData: CreateOrderAndTransactionInput;
    allOrderItemsId: OrderItemDomain['id'][];
  }> {
    const usableDaysAfterPurchased =
      await this.usableDaysService.getCurrentUsableDaysAfterPurchased();
    if (!usableDaysAfterPurchased) {
      throw ErrorApiResponse.conflictRequest(
        `Could not find the after-purchased usable days. Please recheck before try again.`,
      );
    }

    const createOrderData: CreateOrderAndTransactionInput = {
      payload: { id: String(this.uuidService.make()), totalPrice },
      accountId,
      usableDaysAfterPurchasedId: usableDaysAfterPurchased.id,
      updateStockAmountInfo,
    };

    const allOrderItemsId: OrderItemDomain['id'][] = [];

    if (items.vouchers && items.vouchers.length > 0) {
      createOrderData.voucherIdList = items.vouchers.map((item) => {
        const orderItem = {
          id: String(this.uuidService.make()),
          voucherId: item.id,
        };
        allOrderItemsId.push(orderItem.id);
        return orderItem;
      });
    }

    if (items.promotions && items.promotions.length > 0) {
      createOrderData.promotionIdList = items.promotions.map((item) => {
        const orderItem = {
          id: String(this.uuidService.make()),
          promotionId: item.id,
        };
        allOrderItemsId.push(orderItem.id);
        return orderItem;
      });
    }

    if (items.packages && items.packages.length > 0) {
      createOrderData.packageIdList = items.packages.reduce(
        (acc, curr) => {
          acc.quotaList = new Array(curr.quotaAmount).fill({
            id: String(this.uuidService.make()),
            voucherId: curr.quotaVoucherId,
            packageId: curr.id,
          });

          acc.quotaList.forEach((item) => allOrderItemsId.push(item.id));

          acc.rewardList = curr.rewardVouchers.map((rewardVoucher) => {
            const orderItem = {
              id: String(this.uuidService.make()),
              voucherId: rewardVoucher.id,
              packageId: curr.id,
            };
            allOrderItemsId.push(orderItem.id);
            return orderItem;
          });
          return acc;
        },
        { quotaList: [], rewardList: [] },
      );
    }

    return { createOrderData, allOrderItemsId };
  }
  /******  96c98f06-09c0-4f22-9049-b9bc6c9784ed  *******/

  // --------------------------------------------------------------------------//
  // --------------------------------------------------------------------------//
  // ---------------------- FINISHED CREATING ORDER PART ----------------------//
  // --------------------------------------------------------------------------//
  // --------------------------------------------------------------------------//
}
