import { Injectable } from '@nestjs/common';
import {
  ORDER_ITEM_SORT_MAP_TO_DB,
  OrderItemDomain,
  OrderItemRedeemStatusEnum,
  OrderItemSortEnum,
  OrderItemTypeEnum,
} from '@resources/order-item/domain/order-item.domain';
import { OrderItemRepository } from 'src/infrastructure/persistence/order-item/order-item.repository';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { isUUID } from 'class-validator';
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';
import { ISortOption, SORT_DIRECTION } from 'src/common/types/pagination.type';
import { CategoryDomain } from '@resources/category/domain/category.domain';
import {
  UpdateOrderItemDto,
  UpdateOrderItemQrcode,
} from './dto/update-order-item';
import { TransactionStatusEnum } from '@resources/transaction/domain/transaction.domain';
import {
  MailService,
  OrderItemDetailForMail,
} from '@application/mail/mail.service';
import { IMailData } from '@application/mail/mail-data.interface';

@Injectable()
export class OrderItemService {
  constructor(
    private readonly orderItemRepository: OrderItemRepository,
    private readonly mailService: MailService,
  ) {}

  public async findExistingCode(
    codeList: OrderItemDomain['code'][],
  ): Promise<OrderItemDomain['code'][]> {
    return this.orderItemRepository.findManyExistingCode(codeList);
  }

  public async findById(id: OrderItemDomain['id']): Promise<OrderItemDomain> {
    const orderItem = await this.orderItemRepository.findById(id);
    if (!orderItem)
      throw ErrorApiResponse.notFoundRequest(
        `Order Item ID: ${id} could not be found.`,
      );

    return orderItem;
  }

  public async getPagination({
    cursor,
    category,
    sortOption,
    status,
    type,
  }: {
    sortOption?: string;
    cursor?: OrderItemDomain['id'];
    category?: CategoryDomain['name'];
    status?: OrderItemRedeemStatusEnum;
    type?: OrderItemTypeEnum;
  }) {
    if (cursor && !isUUID(cursor, 7))
      throw ErrorApiResponse.conflictRequest(
        `${cursor} is not valid data type for cursor query.`,
      );

    const statusToQuery = this.checkStatusQuery(status);
    const typeToQuery = this.checkTypeToQuery(type);
    const sortQuery = this.formatSortQueryOption(sortOption);

    return this.orderItemRepository.findMany({
      cursor,
      category,
      sortQuery,
      status: statusToQuery,
      type: typeToQuery,
    });
  }

  private checkStatusQuery = (
    status: OrderItemRedeemStatusEnum,
  ): OrderItemRedeemStatusEnum => {
    return EnumCheckerHelper.getEnumValueOrThrow(
      OrderItemRedeemStatusEnum,
      status,
      OrderItemRedeemStatusEnum.ALL,
    );
  };

  private checkTypeToQuery = (type: OrderItemTypeEnum): OrderItemTypeEnum => {
    return EnumCheckerHelper.getEnumValueOrThrow(
      OrderItemTypeEnum,
      type,
      OrderItemTypeEnum.ALL,
    );
  };

  private formatSortQueryOption = (sortQuery: string): ISortOption[] => {
    if (!sortQuery)
      // Default query
      return [
        {
          field: ORDER_ITEM_SORT_MAP_TO_DB[OrderItemSortEnum.CREATED_AT],
          direction: SORT_DIRECTION.ASCENSION,
        },
      ];

    return sortQuery.split(',').map((query) => {
      // Default to "createdat asc" if nothing is provided
      const [rawKey, rawDirection] = query.split(':'); // ["name", "asc"]
      if (!EnumCheckerHelper.checkEnumValue(OrderItemSortEnum, rawKey))
        throw ErrorApiResponse.badRequest(`Invalid sort key: ${rawKey}`);

      const field = ORDER_ITEM_SORT_MAP_TO_DB[rawKey];
      const direction =
        rawDirection === SORT_DIRECTION.DESCENSION
          ? SORT_DIRECTION.DESCENSION
          : SORT_DIRECTION.ASCENSION;

      return { field, direction };
    });
  };

  // --------------------------------------------------------------
  // ------------------------- UPDATE PART ------------------------
  // --------------------------------------------------------------

  /**
   * Updates an order item.
   * @param data - The data to update the order item.
   * @returns The updated order item.
   * @throws {ErrorApiResponse} If the request is invalid.
   * @throws {ErrorApiResponse} If the order item does not exist.
   */
  public async updateOrderItem(
    data: UpdateOrderItemDto,
  ): Promise<OrderItemDomain> {
    // Validate the request
    if (!data || Object.keys(data).length === 1)
      throw ErrorApiResponse.badRequest(
        'Please provide the required information for this request.',
      );

    const findOrderItemPromise = [this.orderItemRepository.findById(data.id)];

    if (data.code)
      findOrderItemPromise.push(this.orderItemRepository.findByCode(data.code));

    // Check if the order item exists
    const [isOrderItemExist, isCodeExist] =
      await Promise.all(findOrderItemPromise);

    if (!isOrderItemExist)
      throw ErrorApiResponse.notFoundRequest(
        `Order ID: ${data.id} could not be found.`,
      );

    if (isCodeExist)
      throw ErrorApiResponse.badRequest(`Code ${data.code} already exist`);
    // Update the order item
    return this.orderItemRepository.update(data);
  }

  public async updateManyQRCodeAfterCreated(
    data: UpdateOrderItemQrcode[],
  ): Promise<OrderItemDomain[]> {
    return this.orderItemRepository.transactionForUpdateManyQrCode(data);
  }

  public async resendEmail(
    itemId: OrderItemDomain['id'],
  ): Promise<OrderItemDomain> {
    if (!itemId || !isUUID(itemId))
      throw ErrorApiResponse.badRequest(
        `${itemId} is not valid type for order item id.`,
      );

    const orderItem = await this.orderItemRepository.findById(itemId);
    console.log(orderItem);

    if (!orderItem)
      throw ErrorApiResponse.notFoundRequest(
        `Order item id: ${itemId} could not be found on this server.`,
      );

    if (orderItem.order.transaction.status !== TransactionStatusEnum.SUCCESS)
      throw ErrorApiResponse.conflictRequest(
        `Order item id: ${itemId} payment status is not success. Please finish the payment process first.`,
      );

    if (orderItem.redeemedAt)
      throw ErrorApiResponse.conflictRequest(
        `Order item id:${itemId} is already redeemed`,
      );

    if (
      !orderItem.qrcodeImagePath ||
      orderItem.qrcodeImagePath === OrderItemDomain.defaultQrCodeImagePath()
    )
      throw ErrorApiResponse.conflictRequest(
        `Order item id: ${itemId} does not finishing generated qrcode process. Please contact the developer or finishing the payment process.`,
      );

    const {} = orderItem;

    // const mailData: IMailData<OrderItemDetailForMail> = {
    //   data: {
    //     ...orderItem,
    //   },
    //   to: orderItem.order.account.email,
    // };

    // await this.mailService.orderItem();

    return orderItem;
  }
}
