import { Injectable } from '@nestjs/common';
import {
  CreateOrderAndTransactionInput,
  CreateOrderItemInfo,
  CreateOrderItemPackageInfo,
  CreateOrderItemVoucherInfo,
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
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { UUIDService } from '@utils/services/uuid.service';
import { OrderItemDomain } from '../order-item/domain/order-item.domain';
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
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';
import { ProductTypeEnum } from 'src/common/types/product.type';
import { VoucherDiscountStatusEnum } from '@resources/voucher/domain/voucher-discount.domain';
import { PackageDiscountStatusEnum } from '@resources/package/domain/package-discount.domain';
import { ProductDomainHelper } from 'src/common/product.helper';

type AnyItemDomain = VoucherDomain | PackageVoucherDomain;

type OrderItemVoucherContainer = {
  type: 'voucher';
  items: CreateOrderItemVoucherInfo[];
};

type OrderItemPackageContainer = {
  type: 'package';
  items: CreateOrderItemPackageInfo[];
};

type OrderItemsProductList =
  | OrderItemVoucherContainer
  | OrderItemPackageContainer;
@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private orderItemService: OrderItemService,
    private voucherService: VoucherService,
    private packageVoucherService: PackageVoucherService,
    private transactionService: TransactionService,
    private uuidService: UUIDService,
    private randomCodeGeneratorService: RandomCodeGeneratorService,
    private eventEmitter: EventEmitter2,
    private productDomainHelper: ProductDomainHelper,
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
    const {
      allOrderItemsId,
      allOrderItemsInfo,
      totalPrice,
      updateStockAmountInfo,
      orderItemsVoucherList,
      orderItemsPackageList,
    } = await this.findAllOrderItemInfoAndTotalPriceAndCheckingStock(data);

    // Generate unique code for each data
    const createOrderItemsWithAssignedCode = await this.assignCodeForData(
      allOrderItemsInfo,
      allOrderItemsId.length,
    );

    return this.orderRepository.createOrderAndTransaction({
      payload: { id: String(this.uuidService.make()), totalPrice },
      allOrderItemsInfo: createOrderItemsWithAssignedCode,
      accountId,
      updateStockAmountInfo,
      orderItemsVoucherInfo: orderItemsVoucherList.items,
      orderItemsPackageInfo: orderItemsPackageList.items,
      transaction: {
        id: String(this.uuidService.make()),
        status: TransactionStatusEnum.PENDING,
      },
    });
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
    allOrderItemsInfo: CreateOrderItemInfo[];
    allOrderItemsId: OrderItemDomain['id'][];
    orderItemsVoucherList: OrderItemVoucherContainer;
    orderItemsPackageList: OrderItemPackageContainer;
    totalPrice: number;
    updateStockAmountInfo: UpdateStockAmountInfo;
  }> {
    const creatingOrderId = String(this.uuidService.make());

    const allOrderItemsInfo: CreateOrderItemInfo[] = [];

    const updateStockAmountInfo: UpdateStockAmountInfo = {
      vouchers: [],
      packages: [],
    };

    const allOrderItemsId: OrderItemDomain['id'][] = [];

    const orderItemsVoucherList: OrderItemVoucherContainer = {
      type: 'voucher',
      items: [],
    };
    const orderItemsPackageList: OrderItemPackageContainer = {
      type: 'package',
      items: [],
    };

    const allItemsInfoPromisesArr = this.prepareItemInfoAndMutateDataArr({
      items: data.items,
      allOrderItemsId,
      allOrderItemsInfo,
      updateStockAmountInfo,
      orderId: creatingOrderId,
      orderItemsVoucherList,
      orderItemsPackageList,
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
    return {
      allOrderItemsId,
      allOrderItemsInfo,
      orderItemsVoucherList,
      orderItemsPackageList,
      totalPrice,
      updateStockAmountInfo,
    };
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
        `The ${typeOfOrderItem} ID:${item.id} only have ${item.stockAmount} in stock and not enough for making order.`,
      );
    }

    // Return the item if everything is in order
    return item;
  }

  private prepareItemInfoAndMutateDataArr({
    items,
    allOrderItemsId,
    allOrderItemsInfo,
    updateStockAmountInfo,
    orderItemsVoucherList,
    orderItemsPackageList,
    orderId,
  }: {
    items: CreateOrderItem[];
    allOrderItemsInfo: CreateOrderItemInfo[];
    allOrderItemsId: OrderItemDomain['id'][];
    orderItemsVoucherList: OrderItemVoucherContainer;
    orderItemsPackageList: OrderItemPackageContainer;
    updateStockAmountInfo: UpdateStockAmountInfo;
    orderId: OrderDomain['id'];
  }): Promise<number>[] {
    return items.map(async (item) => {
      let itemPrice = 0;

      switch (item.type) {
        case ProductTypeEnum.VOUCHER: {
          const voucher = await this.checkOrderItemInfo({
            orderItem: item,
            dbQueryFunc: this.voucherService.getVoucherById.bind(
              this.voucherService,
            ),
            typeOfOrderItem: ProductTypeEnum.VOUCHER,
          });
          itemPrice = this.findEachItemDataAndMutateTotalSumAndData({
            orderItemsProductList: orderItemsVoucherList,
            currentSum: itemPrice,
            itemList: allOrderItemsInfo,
            updateStockAmountInfo: updateStockAmountInfo.vouchers,
            itemInfo: voucher,
            itemAmount: item.amount,
            allOrderItemsId,
            appliedDiscountStatus: VoucherDiscountStatusEnum.ACTIVE,
            orderId,
          });
          break;
        }
        case ProductTypeEnum.PACKAGE: {
          const packageVoucher = await this.checkOrderItemInfo({
            orderItem: item,
            dbQueryFunc: this.packageVoucherService.getPackageVoucherById.bind(
              this.packageVoucherService,
            ),
            typeOfOrderItem: 'Package voucher',
          });
          itemPrice = this.findEachItemDataAndMutateTotalSumAndData({
            currentSum: itemPrice,
            itemList: allOrderItemsInfo,
            orderItemsProductList: orderItemsPackageList,
            updateStockAmountInfo: updateStockAmountInfo.packages,
            itemInfo: packageVoucher,
            itemAmount: item.amount,
            allOrderItemsId,
            appliedDiscountStatus: PackageDiscountStatusEnum.ACTIVE,
            orderId,
          });
          break;
        }
        default:
          throw ErrorApiResponse.conflictRequest(
            `Unknown voucher type: ${item.type}`,
          );
      }

      return itemPrice;
    });
  }

  private findEachItemDataAndMutateTotalSumAndData({
    itemAmount,
    currentSum,
    itemList,
    updateStockAmountInfo,
    itemInfo,
    allOrderItemsId,
    orderItemsProductList,
    appliedDiscountStatus,
    orderId,
  }: {
    itemAmount: number;
    currentSum: number;
    itemList: CreateOrderItemInfo[];
    updateStockAmountInfo: UpdateStockAmountEachInfo[];
    allOrderItemsId: OrderItemDomain['id'][];
    orderItemsProductList: OrderItemsProductList;
    itemInfo: AnyItemDomain;
    appliedDiscountStatus:
      | VoucherDiscountStatusEnum
      | PackageDiscountStatusEnum;
    orderId: OrderDomain['id'];
  }): number {
    // Calculate price part

    const { discount, usableAt, usableExpiredAt, price } = itemInfo;
    let totalPriceOfItems: number;
    const isDiscountApplied =
      this.productDomainHelper.checkDiscountAvailability(
        itemInfo,
        appliedDiscountStatus,
      );
    if (isDiscountApplied) {
      totalPriceOfItems = CalculatorService.multiply(
        discount.discountedPrice,
        itemAmount,
      );
    } else {
      totalPriceOfItems = CalculatorService.multiply(price, itemAmount);
    }

    currentSum = CalculatorService.add(currentSum, totalPriceOfItems);
    // FINISH Calculate price part

    if (
      itemInfo instanceof PackageVoucherDomain &&
      orderItemsProductList.type === 'package'
    ) {
      // Ensure itemList is an object (not an array)

      // console.log(itemInfo.rewardVouchers);
      for (const item of itemInfo.rewardVouchers) {
        const { amount, voucherId } = item;

        const totalItemAmount = CalculatorService.multiply(itemAmount, amount);

        const orderItemReward: CreateOrderItemInfo = {
          id: null,
          orderId,
          countNumber: null,
          qrcodeImagePath: OrderItemDomain.waitForUploadQrCodeImagePath(),
          code: null,
          usableAt,
          usableExpiredAt,
        };

        const orderItemDetail: CreateOrderItemPackageInfo = {
          id: String(this.uuidService.make()),
          orderItemId: null,
          packageId: itemInfo.id,
          voucherId,
          reward: true,
        };

        if (isDiscountApplied) {
          orderItemDetail.discount = {
            id: discount.id,
            discountedPrice: discount.discountedPrice,
          };
        }

        const orderItemsPackageRewardArr: CreateOrderItemPackageInfo[] =
          Array(totalItemAmount).fill(orderItemDetail);
        // OrderItem array
        const rewardsVoucherArr: CreateOrderItemInfo[] = Array(totalItemAmount)
          .fill(orderItemReward)
          .map((item, index) => {
            const orderItemId = String(this.uuidService.make());
            item.id = orderItemId;
            item.countNumber = index + 1;
            orderItemsPackageRewardArr[index].orderItemId = orderItemId;
            allOrderItemsId.push(item.id);
            return item;
          });

        itemList.push(...rewardsVoucherArr);
        orderItemsProductList.items.push(...orderItemsPackageRewardArr);
      }

      const totalItemAmount = CalculatorService.multiply(
        itemAmount,
        itemInfo.quotaAmount,
      );

      const quotaVoucherDetail: CreateOrderItemPackageInfo = {
        id: String(this.uuidService.make()),
        orderItemId: null,
        packageId: itemInfo.id,
        voucherId: itemInfo.quotaVoucherId,
        reward: false,
      };

      if (isDiscountApplied) {
        quotaVoucherDetail.discount = {
          id: discount.id,
          discountedPrice: discount.discountedPrice,
        };
      }

      const orderItemsPackageQuotaArr: CreateOrderItemPackageInfo[] =
        Array(totalItemAmount).fill(quotaVoucherDetail);

      const quotaVoucher: CreateOrderItemInfo = {
        id: null,
        code: null,
        countNumber: null,
        usableAt,
        usableExpiredAt,
        orderId,
        qrcodeImagePath: OrderItemDomain.waitForUploadQrCodeImagePath(),
      };
      const quotaVoucherArr: CreateOrderItemInfo[] = Array(totalItemAmount)
        .fill(quotaVoucher)
        .map((item, index): CreateOrderItemInfo => {
          const orderItemId = String(this.uuidService.make());
          item.id = orderItemId;
          item.countNumber = index + 1;
          orderItemsPackageQuotaArr[index].orderItemId = orderItemId;
          allOrderItemsId.push(item.id);
          return item;
        });
      itemList.push(...quotaVoucherArr);
      orderItemsProductList.items.push(...orderItemsPackageQuotaArr);
    } else {
      if (!Array.isArray(itemList))
        throw new Error('Expected an array, but got an object.');

      if (orderItemsProductList.type !== 'voucher')
        throw new Error(
          'Expected an order items voucher array, but got an other-type instead.',
        );

      const orderItemVoucherInfo: CreateOrderItemVoucherInfo = {
        id: String(this.uuidService.make()),
        orderItemId: null,
        voucherId: itemInfo.id,
      };

      if (isDiscountApplied) {
        orderItemVoucherInfo.discount = {
          id: discount.id,
          discountedPrice: discount.discountedPrice,
        };
      }

      const orderItemVoucherArr: CreateOrderItemVoucherInfo[] =
        Array(itemAmount).fill(orderItemVoucherInfo);

      const orderItemInfo: CreateOrderItemInfo = {
        id: null,
        code: null,
        countNumber: null,
        usableAt,
        usableExpiredAt,
        orderId,
        qrcodeImagePath: OrderItemDomain.waitForUploadQrCodeImagePath(),
      };

      itemList.push(
        ...Array(itemAmount)
          .fill(orderItemInfo)
          .map((item, index) => {
            const orderItemId = String(this.uuidService.make());
            item.id = orderItemId;
            item.countNumber = index + 1;
            orderItemVoucherArr[index].orderItemId = orderItemId;
            allOrderItemsId.push(item.id);
            return item;
          }),
      );

      orderItemsProductList.items.push(...orderItemVoucherArr);
    }

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
      }

      return Array.from(uniqueCode);
    }
  }

  private async assignCodeForData(
    createOrderItemsList: CreateOrderItemInfo[],
    numsOfItems: number,
  ): Promise<CreateOrderItemInfo[]> {
    if (
      createOrderItemsList.length === 0 ||
      createOrderItemsList.length < numsOfItems
    ) {
      throw ErrorApiResponse.internalServerError(
        'The order items to provide code is less than the number of items to create. Please contact developer to fix the issue.',
      );
    }

    const allUniqueGeneratedCode =
      await this.generateCodeForOrderItem(numsOfItems);
    if (allUniqueGeneratedCode.length !== numsOfItems) {
      throw ErrorApiResponse.internalServerError(
        `Not enough generated code: ${allUniqueGeneratedCode.length} for ${numsOfItems} order items. Please contact developer to fix the issue.`,
      );
    }

    let codeIndex: number = 0;
    return createOrderItemsList.map((item) => {
      item.code = allUniqueGeneratedCode[codeIndex++];
      return item;
    });
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
    const transactionStatusQuery =
      this.checkTransactionStatus(transactionStatus);

    if (cursor && !isUUID(cursor, 7))
      throw ErrorApiResponse.conflictRequest(
        'Provided parameter for cursor is invaid.',
      );

    return this.orderRepository.findMany({
      cursor,
      transactionStatus: transactionStatusQuery,
    });
  }

  private checkTransactionStatus(
    status: TransactionDomain['status'],
  ): TransactionStatusEnum {
    return EnumCheckerHelper.getEnumValueOrThrow(
      TransactionStatusEnum,
      status,
      TransactionStatusEnum.SUCCESS,
    );
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

      const transaction =
        await this.transactionService.makePaymentAndUpdateTransaction({
          transactionId: orderAndTransaction.transaction.id,
          token: paymentToken,
          amount: orderAndTransaction.totalPrice,
          description: `Transaction for order ID: ${orderAndTransaction.id}`,
        });

      if (transaction.status !== TransactionStatusEnum.SUCCESS)
        throw ErrorApiResponse.badRequest('Transaction failed.');

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
      throw ErrorApiResponse.conflictRequest(err.message);
    }
  }

  private async checkOrderAndTransaction(
    orderId: OrderDomain['id'],
  ): Promise<OrderDomain> {
    const order = await this.orderRepository.findById(orderId);

    if (!order)
      throw ErrorApiResponse.notFoundRequest(
        `Order ID: ${orderId} could not be found.`,
      );

    if (!order.account.verifiedAt)
      throw ErrorApiResponse.conflictRequest(
        `The Order ID: ${order.id} created by un-verified account. Please verify account before making transaction.`,
      );
    if (!order.account.email || !order.id)
      throw ErrorApiResponse.internalServerError(
        `The account ID : ${order.account.id} does not have valid information.`,
      );

    if (!order.transaction || Object.keys(order.transaction).length === 0)
      throw ErrorApiResponse.conflictRequest(
        `Order ID: ${order.id} does not have any transaction.`,
      );

    // If transaction have been expired.
    // throw error

    if (
      new Date(order.transaction.expiredAt) < new Date() &&
      order.transaction.status === TransactionStatusEnum.PENDING
    )
      throw ErrorApiResponse.conflictRequest(
        `Transaction of order ID: ${orderId} has expired at ${order.transaction.expiredAt.toLocaleString()}.`,
      );
    if (
      order.transaction.status === TransactionStatusEnum.SUCCESS ||
      order.transaction.paymentId
    ) {
      throw ErrorApiResponse.conflictRequest(
        `Transaction of order ID: ${orderId} has already been processed.`,
      );
    }
    if (order.transaction.deletedAt)
      throw ErrorApiResponse.conflictRequest(
        `Transaction of order ID: ${order} has been deleted at ${order.transaction.deletedAt.toLocaleString()}.`,
      );

    return order;
  }
}
