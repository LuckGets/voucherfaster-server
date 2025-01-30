import { Injectable } from '@nestjs/common';
import { OrderItemService } from '@resources/order-item/order-item.service';
import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';
import { OwnerService } from '@resources/owner/owner.service';
import { RedeemItemDto } from './dto/redeem-item.dto';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { TransactionStatusEnum } from '@resources/transaction/domain/transaction.domain';
import { RedeemItemRepository } from 'src/infrastructure/persistence/redeem/redeem.repository';
import { UUIDService } from '@utils/services/uuid.service';

@Injectable()
export class RedeemService {
  constructor(
    private readonly redeemRepository: RedeemItemRepository,
    private readonly uuidService: UUIDService,
    private readonly orderItemService: OrderItemService,
    private readonly ownerService: OwnerService,
  ) {}
  public async redeemItemById(body: RedeemItemDto): Promise<OrderItemDomain> {
    const { orderItemId, passwordForRedeem } = body;

    const orderItem = await this.checkOrderItemBeforeRedeem(orderItemId);
    const isPasswordMatch =
      await this.ownerService.checkPasswordForRedeem(passwordForRedeem);
    if (!isPasswordMatch)
      throw ErrorApiResponse.unauthorizedRequest(
        'The identifier information is incorrect. Please try again.',
      );

    return this.redeemRepository.create({
      id: String(this.uuidService.make()),
      orderItemId: orderItem.id,
    });
  }

  private async checkOrderItemBeforeRedeem(itemId: OrderItemDomain['id']) {
    const waitForUploadQrCodeImagePath =
      OrderItemDomain.waitForUploadQrCodeImagePath();
    const orderItem = await this.orderItemService.findById(itemId);

    if (!orderItem)
      throw ErrorApiResponse.notFoundRequest(
        `Order Item ID: ${itemId} could not be found.`,
      );

    if (new Date(orderItem.usableAt) > new Date())
      throw ErrorApiResponse.conflictRequest(
        `The item code ${orderItem.code} is not available to redeem yet. Please try again after ${orderItem.usableAt.toLocaleString()}.`,
      );

    if (orderItem.order.transaction.status !== TransactionStatusEnum.SUCCESS)
      throw ErrorApiResponse.conflictRequest(
        `The order ID: ${orderItem.order.id} has not been paid yet. Please pay the order before redeeming the item.`,
      );

    // if (!orderItem.order.account.verifiedAt)
    //   throw ErrorApiResponse.conflictRequest(
    //     `The account which owned order ID: ${orderItem.order.id} is now un-verified account. Please verify account before redeeming the item.`,
    //   );

    if (orderItem.usableExpiredAt < new Date())
      throw ErrorApiResponse.conflictRequest(
        `The item code ${orderItem.code} can't be redeem due to the item is expired. Expired at : ${orderItem.usableExpiredAt.toLocaleString()}.`,
      );

    if (orderItem.redeemedAt)
      throw ErrorApiResponse.badRequest('This order item has been redeemed.');

    if (orderItem.qrcodeImagePath === waitForUploadQrCodeImagePath)
      throw ErrorApiResponse.conflictRequest(
        `The redeeming process for the item, code: ${
          orderItem.code
        } is not ready.`,
      );

    return orderItem;
  }
}
