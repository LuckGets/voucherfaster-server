import { Injectable } from '@nestjs/common';
import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { OrderItemRepository } from 'src/infrastructure/persistence/order-item/order-item.repository';
import { UpdateOrderItemDto } from './dto/update.dto';
import { ErrorApiResponse } from 'src/common/core-api-response';

@Injectable()
export class OrderItemService {
  constructor(private orderItemRepository: OrderItemRepository) {}

  public async updateOrderItem(
    data: UpdateOrderItemDto,
  ): Promise<OrderItemDomain> {
    if (!data || Object.keys(data).length === 0)
      throw ErrorApiResponse.badRequest();
    const isOrderItemExist = await this.orderItemRepository.findById(data.id);

    if (!isOrderItemExist)
      throw ErrorApiResponse.notFoundRequest(
        `Order ID: ${data.id} could not be found.`,
      );

    return this.orderItemRepository.update(data);
  }

  public async updateManyQRCodeAfterCreated(
    data: UpdateOrderItemDto[],
  ): Promise<OrderItemDomain[]> {
    return this.orderItemRepository.transactionForUpdateMany(data);
  }
}
