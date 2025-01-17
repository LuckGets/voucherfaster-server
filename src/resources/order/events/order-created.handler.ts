import { OnEvent } from '@nestjs/event-emitter';
import { ORDER_EVENT_CONSTANT, OrderCreatedEvent } from './order.events';
import { Injectable, Logger } from '@nestjs/common';
import { QRCodeService } from '@utils/services/qr-code.service';
import { ConfigService } from '@nestjs/config';
import { FRONTEND_PATH } from 'src/config/api-path';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { UpdateOrderItemDto } from '@resources/order-item/dto/update.dto';
import { OrderItemDomain } from '../domain/order-item.domain';
import { OrderItemService } from '@resources/order-item/order-item.service';

@Injectable()
export class OrderCreatedHandler {
  private frontEndDomain: string;
  constructor(
    private qrCodeService: QRCodeService,
    private configService: ConfigService,
    private mediaService: MediaService,
    private orderItemService: OrderItemService,
  ) {
    this.frontEndDomain = configService.getOrThrow('client.domain', {
      infer: true,
    });
  }
  private logger: Logger = new Logger(OrderCreatedHandler.name);
  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Handle the ORDER_EVENT_CONSTANT.CREATED event.
   * This event is emitted when the OrderService create a new order.
   * @param event - The OrderCreatedEvent payload.
   */
  @OnEvent(ORDER_EVENT_CONSTANT.CREATED, { nextTick: true })
  async handle(event: OrderCreatedEvent) {
    this.logger.log(
      `OrderCreatedEvent: Processing ${OrderCreatedEvent.length} order items.`,
    );
    const updateOrderItem: UpdateOrderItemDto[] = await Promise.all(
      event.orderItems.map(this.handleCreateQRCodeAndUploadImage),
    );
    return this.orderItemService.updateManyQRCodeAfterCreated(updateOrderItem);
  }

  async handleCreateQRCodeAndUploadImage(
    orderItem: OrderCreatedEvent['orderItems'][number],
  ): Promise<UpdateOrderItemDto> {
    try {
      this.logger.log(`Generate QRCode for OrderItem ID: ${orderItem}`);
      const urlData = `${this.frontEndDomain}/${FRONTEND_PATH.RETRIEVE_ORDER_ITEM}/${orderItem}`;
      const { buffer, mimetype } =
        await this.qrCodeService.generateQRCodeAsBuffer(urlData);

      const qrcodeImagePath = await this.mediaService.uploadFile(
        buffer,
        `Order-item-ID:${orderItem}`,
        mimetype,
        s3BucketDirectory.qrcodeImg,
      );
      this.logger.log(
        `Upload QRCode to S3 for OrderItem ID: ${orderItem}. \nIMG url: ${qrcodeImagePath}`,
      );
      return { id: orderItem, qrcodeImagePath };
    } catch (err) {
      this.logger.error(
        `There is an error while upload image: ${err.message}`,
        err,
      );
    }
  }
}
