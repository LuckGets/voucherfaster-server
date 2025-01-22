import { Injectable } from '@nestjs/common';
import {
  CreateOrderAndTransactionInput,
  CreateOrderPromotionIdList,
  CreateOrderVoucherIdList,
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
import { CalculatorService } from '@utils/services/calculator.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NullAble } from '@utils/types/common.type';
import { isUUID } from 'class-validator';
import { RandomCodeGeneratorService } from '@utils/services/random-code/random-code.service';
import { OrderItemService } from '@resources/order-item/order-item.service';
import {
  TransactionDomain,
  TransactionStatusEnum,
} from '@resources/transaction/domain/transaction.domain';
import { ProcessPaymentDto } from './dto/transactions/process-payment.dto';
import { TransactionService } from '@resources/transaction/transaction.service';
import { ORDER_EVENT_CONSTANT, OrderSuccessEvent } from './events/order.events';
import { HttpRequestWithUser } from 'src/common/http.type';
import { RoleEnum } from '@resources/account/types/account.type';

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
    private orderItemService: OrderItemService,
    private voucherService: VoucherService,
    private packageVoucherService: PackageVoucherService,
    private usableDaysService: UsableDaysService,
    private transactionService: TransactionService,
    private uuidService: UUIDService,
    private randomCodeGeneratorService: RandomCodeGeneratorService,
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
    const { items, totalPrice, updateStockAmountInfo } =
      await this.findAllOrderItemInfoAndTotalPriceAndCheckingStock(data);

    const createOrderData = await this.prepareCreateOrderData({
      accountId,
      items,
      totalPrice,
      updateStockAmountInfo,
    });

    const order =
      await this.orderRepository.createOrderAndTransaction(createOrderData);
    return order;
  }

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
      let itemPrice = 0;

      switch (item.type) {
        case 'voucher': {
          const voucher = await this.checkOrderItemInfo({
            orderItem: item,
            dbQueryFunc: this.voucherService.getVoucherById.bind(
              this.voucherService,
            ),
            typeOfOrderItem: 'Voucher',
          });
          itemPrice =
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
            dbQueryFunc: this.voucherService.getVoucherPromotionById.bind(
              this.voucherService,
            ),
            typeOfOrderItem: 'Promotion',
          });
          itemPrice =
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
            dbQueryFunc: this.packageVoucherService.getPackageVoucherById.bind(
              this.packageVoucherService,
            ),
            typeOfOrderItem: 'Package voucher',
          });
          itemPrice =
            this.findEachItemDataAndMutateTotalSumAndData<PackageVoucherDomain>(
              {
                currentSum: itemPrice,
                itemInfoArr: allItemsInfo.packages,
                updateStockAmountInfo: updateStockAmountInfo.packages,
                itemInfo: packageVoucher,
                itemAmount: item.amount,
                itemPrice: packageVoucher.price,
              },
            );
          break;
        }
        default:
          throw ErrorApiResponse.conflictRequest(
            `Unknown voucher type: ${item.type}`,
          );
      }

      return itemPrice;
    });

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
  }): number {
    const totalPriceOfItmes = CalculatorService.multiply(itemPrice, itemAmount);
    currentSum = CalculatorService.add(currentSum, totalPriceOfItmes);
    itemInfoArr.push(...Array(itemAmount).fill(itemInfo));

    // Finding if any items is duplicate
    const isIndexItemExist = updateStockAmountInfo.findIndex(
      (item) => item.id === itemInfo.id,
    );
    if (isIndexItemExist >= 0) {
      const currStock =
        updateStockAmountInfo[isIndexItemExist].updatedStockAmount;
      updateStockAmountInfo[isIndexItemExist].updatedStockAmount =
        CalculatorService.minus(currStock, itemAmount);
    } else {
      updateStockAmountInfo.push({
        id: itemInfo.id,
        updatedStockAmount: CalculatorService.minus(
          itemInfo.stockAmount,
          itemAmount,
        ),
      });
    }

    return currentSum;
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
    const item: AnyItemDomain = await dbQueryFunc(orderItem.id);

    // Throw an error if the item is not found
    if (!item) {
      throw ErrorApiResponse.notFoundRequest(
        `${typeOfOrderItem} with ID ${orderItem.id} not found.`,
      );
    }

    if (new Date(item.sellExpiredAt) < new Date())
      throw ErrorApiResponse.conflictRequest(
        `The voucher ID: ${item.id} was out of saled since ${item.sellExpiredAt.toLocaleString()}.`,
      );

    if (item.stockAmount === 0) {
      // Check if the item is out of stock
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
  }): Promise<CreateOrderAndTransactionInput> {
    const usableDaysAfterPurchased =
      await this.usableDaysService.getCurrentUsableDaysAfterPurchased();
    if (!accountId)
      throw ErrorApiResponse.internalServerError(
        `Could not find account before creating order.`,
      );

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
      transaction: null,
    };

    const allOrderItemsId: OrderItemDomain['id'][] = [];

    if (items.vouchers && items.vouchers.length > 0) {
      createOrderData.voucherIdList = items.vouchers.map((item) => {
        const orderItem: CreateOrderVoucherIdList[number] = {
          id: String(this.uuidService.make()),
          voucherId: item.id,
          code: null,
        };
        allOrderItemsId.push(orderItem.id);
        return orderItem;
      });
    }

    if (items.promotions && items.promotions.length > 0) {
      createOrderData.promotionIdList = items.promotions.map((item) => {
        const orderItem: CreateOrderPromotionIdList[number] = {
          id: String(this.uuidService.make()),
          promotionId: item.id,
          code: null,
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
              voucherId: rewardVoucher.voucherId,
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

    // Generate unique code for each data
    const createOrderDataWithAssignCode = await this.assignCodeForData(
      createOrderData,
      allOrderItemsId.length,
    );

    // Add all of the generated code to the order items
    createOrderDataWithAssignCode.transaction = {
      id: String(this.uuidService.make()),
      status: TransactionStatusEnum.PENDING,
    };

    return createOrderDataWithAssignCode;
  }

  private async generateCodeForOrderItem(
    numsOfItems: number,
  ): Promise<OrderItemDomain['code'][]> {
    const uniqueCode = new Set<string>();
    while (uniqueCode.size < numsOfItems) {
      {
        const needed = CalculatorService.minus(numsOfItems, uniqueCode.size);

        const batch = this.randomCodeGeneratorService.generateMany(needed);

        const exisitingCode =
          await this.orderItemService.findExistingCode(batch);

        const newUniqueFilteredBatch = batch.filter(
          (code) => !exisitingCode.includes(code),
        );

        newUniqueFilteredBatch.forEach((code) => uniqueCode.add(code));
        console.log('batch', batch);
        console.log('code', uniqueCode);
      }

      return Array.from(uniqueCode);
    }
  }

  private async assignCodeForData(
    createOrderData: CreateOrderAndTransactionInput,
    numsOfItems: number,
  ): Promise<CreateOrderAndTransactionInput> {
    const allUniqueGeneratedCode =
      await this.generateCodeForOrderItem(numsOfItems);
    if (allUniqueGeneratedCode.length !== numsOfItems) {
      throw ErrorApiResponse.internalServerError(
        `Not enough generated code: ${allUniqueGeneratedCode.length} for ${numsOfItems} order items. Please contact developer to fix the issue.`,
      );
    }
    const createOrderDataWithAssignCode: CreateOrderAndTransactionInput = {
      ...createOrderData,
    };

    // 3) Attach these codes to each item (in the same order they were gathered)
    let codeIndex: number = 0;
    if (createOrderDataWithAssignCode.voucherIdList) {
      createOrderDataWithAssignCode.voucherIdList.forEach((item) => {
        item.code = allUniqueGeneratedCode[codeIndex++];
      });
    }

    if (createOrderDataWithAssignCode.promotionIdList) {
      createOrderDataWithAssignCode.promotionIdList.forEach((item) => {
        item.code = allUniqueGeneratedCode[codeIndex++];
      });
    }

    if (createOrderDataWithAssignCode.packageIdList) {
      createOrderDataWithAssignCode.packageIdList.quotaList.forEach((item) => {
        item.code = allUniqueGeneratedCode[codeIndex++];
      });
      createOrderDataWithAssignCode.packageIdList.rewardList.forEach((item) => {
        item.code = allUniqueGeneratedCode[codeIndex++];
      });
    }

    return createOrderDataWithAssignCode;
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
    transactionStatus,
  }: {
    cursor?: OrderDomain['id'];
    transactionStatus?: TransactionDomain['status'];
  }): Promise<OrderDomain[]> {
    // Check the transaction status query if provided
    if (transactionStatus) {
      for (const key in TransactionStatusEnum) {
        if (transactionStatus.toUpperCase() !== TransactionStatusEnum[key]) {
          return this.orderRepository.findMany({ cursor, transactionStatus });
        }
      }
    }
    throw ErrorApiResponse.badRequest(`Invalid transaction status`);
  }

  public async deleteManyOrderWithUnsuccessTransaction(
    orderIdList: OrderDomain['id'][],
    transactionIdList: TransactionDomain['id'][],
  ): Promise<void> {
    if (!orderIdList || orderIdList.length < 1) return;
    if (!transactionIdList || transactionIdList.length < 1) return;
    await this.orderRepository.deleteManyOrderWithUnsuccessTransaction(
      orderIdList,
      transactionIdList,
    );
    return;
  }

  // -------------------------------------------------------------------- //
  // ------------------------- TRANSACTION PART ------------------------- //
  // -------------------------------------------------------------------- //
  async processPaymentWithOrderId(
    payload: ProcessPaymentDto,
  ): Promise<OrderDomain> {
    try {
      const { orderId, paymentToken } = payload;
      const orderAndTransaction = await this.checkOrderAndTransaction(orderId);

      // const transaction =
      //   await this.transactionService.makePaymentAndUpdateTransaction({
      //     transactionId: orderAndTransaction.transaction.id,
      //     token: paymentToken,
      //     amount: orderAndTransaction.totalPrice,
      //     description: `Transaction for order ID: ${orderAndTransaction.id}`,
      //   });

      // if (transaction.status !== TransactionStatusEnum.SUCCESS)
      //   throw ErrorApiResponse.badRequest('Transaction failed.');

      const allOrderItems = [...orderAndTransaction.orderItems];

      // Emit event
      // for generating qrcode
      // and upload the qrcode to media storage
      // then updating the qrcode
      // for each order item
      // After finish updating, sending email
      this.eventEmitter.emit(
        ORDER_EVENT_CONSTANT.SUCCESS,
        new OrderSuccessEvent(orderAndTransaction.account.email, allOrderItems),
      );

      return this.orderRepository.findById(orderAndTransaction.id);
    } catch (err) {
      console.error(err);
      throw ErrorApiResponse.conflictRequest(err);
    }
  }

  async checkOrderAndTransaction(
    orderId: OrderDomain['id'],
  ): Promise<OrderDomain> {
    const order = await this.orderRepository.findById(orderId);

    // if (!order.account.verifiedAt)
    //   throw ErrorApiResponse.conflictRequest(
    //     `The Order ID: ${order.id} created by un-verified account. Please verify account before making transaction.`,
    //   );
    // if (!order.account.email || !order.id)
    //   throw ErrorApiResponse.internalServerError(
    //     `The account ID : ${order.account.id} does not have valid information.`,
    //   );

    // if (!order.transaction || Object.keys(order.transaction).length === 0)
    //   throw ErrorApiResponse.conflictRequest(
    //     `Order ID: ${order.id} does not have any transaction.`,
    //   );

    // // If transaction have been expired.
    // // throw error

    // if (
    //   new Date(order.transaction.expiredAt) < new Date() &&
    //   order.transaction.status === TransactionStatusEnum.PENDING
    // )
    //   throw ErrorApiResponse.conflictRequest(
    //     `Transaction of order ID: ${orderId} has expired at ${order.transaction.expiredAt.toLocaleString()}.`,
    //   );
    // if (
    //   order.transaction.status === TransactionStatusEnum.SUCCESS ||
    //   order.transaction.paymentId
    // ) {
    //   throw ErrorApiResponse.conflictRequest(
    //     `Transaction of order ID: ${orderId} has already been processed.`,
    //   );
    // }
    // if (order.transaction.deletedAt)
    //   throw ErrorApiResponse.conflictRequest(
    //     `Transaction of order ID: ${order} has been deleted at ${order.transaction.deletedAt.toLocaleString()}.`,
    //   );

    return order;
  }
}
