import { Injectable } from '@nestjs/common';
import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { OrderItemRepository } from 'src/infrastructure/persistence/order-item/order-item.repository';
import { UpdateOrderItemDto } from './dto/update.dto';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { OrderItem } from '@prisma/client';
import { RedeemItemDto } from './dto/redeem-item.dto';
import { OwnerService } from '@resources/owner/owner.service';

@Injectable()
export class OrderItemService {
  constructor(
    private readonly orderItemRepository: OrderItemRepository,
    private readonly ownerService: OwnerService,
  ) {}

  public async findExistingCode(
    codeList: OrderItemDomain['code'][],
  ): Promise<OrderItem['code'][]> {
    return this.orderItemRepository.findManyExistingCode(codeList);
  }

  public async redeemItemById(body: RedeemItemDto): Promise<OrderItemDomain> {
    const { itemId, passwordForRedeem } = body;
    const waitForUploadQrCodeImagePath =
      OrderItemDomain.waitForUploadQrCodeImagePath();
    const orderItem = await this.orderItemRepository.findById(itemId);
    if (!orderItem)
      throw ErrorApiResponse.notFoundRequest(
        `Order Item ID: ${itemId} could not be found.`,
      );

    if (orderItem.redeemedAt)
      throw ErrorApiResponse.badRequest('This order item has been redeemed.');

    if (orderItem.qrcodeImagePath === waitForUploadQrCodeImagePath)
      throw ErrorApiResponse.conflictRequest();
  }

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
    if (!data || Object.keys(data).length === 0)
      throw ErrorApiResponse.badRequest(
        'Please provide the required information for this request.',
      );

    // Check if the order item exists
    const isOrderItemExist = await this.orderItemRepository.findById(data.id);

    if (!isOrderItemExist)
      throw ErrorApiResponse.notFoundRequest(
        `Order ID: ${data.id} could not be found.`,
      );

    // Update the order item
    return this.orderItemRepository.update(data);
  }

  public async updateManyQRCodeAfterCreated(
    data: UpdateOrderItemDto[],
  ): Promise<OrderItemDomain[]> {
    return this.orderItemRepository.transactionForUpdateMany(data);
  }
}
