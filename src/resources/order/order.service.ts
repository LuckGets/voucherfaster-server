import { Injectable } from '@nestjs/common';
import {
  CreateOrderAndTransactionInput,
  OrderRepository,
  UpdateStockAmountEachInfo,
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
import { CalculatorService } from '@utils/services/calculator.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORDER_EVENT_CONSTANT, OrderCreatedEvent } from './events/order.events';
import { NullAble } from '@utils/types/common.type';
import { isUUID } from 'class-validator';

export type OrderItemsInfo = {
  vouchers: VoucherDomain[];
  promotions: VoucherPromotionDomain[];
  packages: PackageVoucherDomain[];
};

type AnyItemDomain =
  | VoucherDomain
  | VoucherPromotionDomain
  | PackageVoucherDomain;

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private voucherService: VoucherService,
    private packageVoucherService: PackageVoucherService,
    private usableDaysService: UsableDaysService,
    private transactionService: TransactionService,
    private uuidService: UUIDService,
    private eventEmitter: EventEmitter2,
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
      await this.findAllOrderItemInfoAndTotalPriceAndCheckingStock(restData);

    const { createOrderData, allOrderItemsId } =
      await this.prepareCreateOrderData({
        accountId,
        items,
        totalPrice,
        updateStockAmountInfo,
      });

    const order =
      await this.orderRepository.createOrderAndTransaction(createOrderData);

    await this.transactionService.processPayment({
      token: paymentToken,
      amount: totalPrice,
      description: `OrderId:${order.id} | TransactionId:${order.transaction.id}`,
      transactionId: order.transaction.id,
    });

    this.eventEmitter.emit(
      ORDER_EVENT_CONSTANT.CREATED,
      new OrderCreatedEvent(allOrderItemsId),
    );
    return order;
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
  private async findAllOrderItemInfoAndTotalPriceAndCheckingStock(
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
      const itemPrice = 0;

      switch (item.voucherType) {
        case 'voucher': {
          const voucher = await this.checkOrderItemInfo({
            orderItem: item,
            dbQueryFunc: this.voucherService.getVoucherById,
            typeOfOrderItem: 'Voucher',
          });
          this.findEachItemDataAndMutateTotalSumAndData<VoucherDomain>({
            currentSum: itemPrice,
            itemInfoArr: allItemsInfo.vouchers,
            updateStockAmountInfo: updateStockAmountInfo.vouchers,
            itemInfo: voucher,
            itemAmount: item.amount,
            itemPrice: voucher.price,
          });
          break;
        }
        case 'promotion': {
          const promotion = await this.checkOrderItemInfo({
            orderItem: item,
            dbQueryFunc: this.voucherService.getVoucherPromotionById,
            typeOfOrderItem: 'Promotion',
          });
          this.findEachItemDataAndMutateTotalSumAndData<VoucherPromotionDomain>(
            {
              currentSum: itemPrice,
              itemInfoArr: allItemsInfo.promotions,
              updateStockAmountInfo: updateStockAmountInfo.promotions,
              itemInfo: promotion,
              itemAmount: item.amount,
              itemPrice: promotion.promotionPrice,
            },
          );
          break;
        }
        case 'package': {
          const packageVoucher = await this.checkOrderItemInfo({
            orderItem: item,
            dbQueryFunc: this.packageVoucherService.getPackageVoucherById,
            typeOfOrderItem: 'Package voucher',
          });
          this.findEachItemDataAndMutateTotalSumAndData<PackageVoucherDomain>({
            currentSum: itemPrice,
            itemInfoArr: allItemsInfo.packages,
            updateStockAmountInfo: updateStockAmountInfo.packages,
            itemInfo: packageVoucher,
            itemAmount: item.amount,
            itemPrice: packageVoucher.price,
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
        (sum, price) => CalculatorService.add(sum, price),
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

  private findEachItemDataAndMutateTotalSumAndData<T extends AnyItemDomain>({
    itemPrice,
    itemAmount,
    currentSum,
    itemInfoArr,
    updateStockAmountInfo,
    itemInfo,
  }: {
    itemPrice: number;
    itemAmount: number;
    currentSum: number;
    itemInfoArr: T[];
    updateStockAmountInfo: UpdateStockAmountEachInfo[];
    itemInfo: T;
  }) {
    const totalPriceOfItmes = CalculatorService.multiply(itemPrice, itemAmount);
    currentSum = CalculatorService.add(currentSum, totalPriceOfItmes);
    itemInfoArr.push(itemInfo);
    updateStockAmountInfo.push({
      id: itemInfo.id,
      updatedStockAmount: CalculatorService.minus(
        itemInfo.stockAmount,
        itemAmount,
      ),
    });
  }

  /**
   * Checks the information of the order item by querying the database using the provided function.
   * Throws an error if the item is not found or if there is insufficient stock.
   *
   * @param {object} params - The parameters for checking the order item.
   * @param {CreateOrderItem} params.orderItem - The order item to check.
   * @param {Function} params.dbQueryFunc - The database query function to retrieve the item.
   * @param {string} params.typeOfOrderItem - The type of order item being checked (e.g., voucher, promotion, package).
   *
   * @returns {Promise<any>} The retrieved item from the database.
   *
   * @throws Will throw an error if the item is not found or if stock is insufficient.
   */
  private async checkOrderItemInfo({
    orderItem,
    dbQueryFunc,
    typeOfOrderItem,
  }: {
    orderItem: CreateOrderItem;
    dbQueryFunc: Function;
    typeOfOrderItem: string;
  }): Promise<any> {
    // Query the database to check if the order item exists
    const item = await dbQueryFunc(orderItem.id);

    // Throw an error if the item is not found
    if (!item) {
      throw new Error(`${typeOfOrderItem} with ID ${orderItem.id} not found.`);
    }

    // Check if the item is out of stock
    if (item.stockAmount === 0) {
      throw ErrorApiResponse.conflictRequest(
        `The ${typeOfOrderItem} ID:${item.id} is now out of stock.`,
      );
    }

    // Check if the available stock is less than the required amount
    if (item.stockAmount < orderItem.amount) {
      throw ErrorApiResponse.conflictRequest(
        `The ${typeOfOrderItem} ID:${item.id} only have ${item.stockAmount} which not enough for making order.`,
      );
    }

    // Return the item if everything is in order
    return item;
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

  // --------------------------------------------------------------------------//
  // --------------------------------------------------------------------------//
  // ---------------------- FINISHED CREATING ORDER PART ----------------------//
  // --------------------------------------------------------------------------//
  // --------------------------------------------------------------------------//

  // ---------------------- FIND ORDER PART -----------------------------------//
  // --------------------------------------------------------------------------//

  public async getOrderById(
    id: OrderDomain['id'],
  ): Promise<NullAble<OrderDomain>> {
    if (!id || !isUUID(id))
      throw ErrorApiResponse.badRequest(
        'Provided parameter for order id is invaid.',
      );

    const order = await this.orderRepository.findById(id);
    if (!order)
      throw ErrorApiResponse.notFoundRequest(
        `Order ID: ${id} could not be found.`,
      );

    return order;
  }

  public async getPaginationOrders({
    cursor,
  }: {
    cursor?: OrderDomain['id'];
  }): Promise<OrderDomain[]> {
    return this.orderRepository.findMany({ cursor });
  }
}
