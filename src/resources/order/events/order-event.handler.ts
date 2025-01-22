import { OnEvent } from '@nestjs/event-emitter';
import { ORDER_EVENT_CONSTANT, OrderSuccessEvent } from './order.events';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { QRCodeService } from '@utils/services/qr-code.service';
import { ConfigService } from '@nestjs/config';
import { FRONTEND_PATH } from 'src/config/api-path';
import { MediaService } from '@application/media/media.service';
import { s3BucketDirectory } from '@application/media/s3/media-s3.type';
import { UpdateOrderItemDto } from '@resources/order-item/dto/update.dto';
import { OrderItemService } from '@resources/order-item/order-item.service';
import { AccountDomain } from '@resources/account/domain/account.domain';
import {
  MailService,
  MailTransporter,
  OrderItemDetailForMail,
} from '@application/mail/mail.service';
import { MailerService } from '@application/mailer/mailer.service';
import { OrderItemDomain } from '../domain/order-item.domain';
import { OwnerService } from '@resources/owner/owner.service';

@Injectable()
export class OrderEventHandler {
  private frontEndDomain: string;
  constructor(
    private qrCodeService: QRCodeService,
    @Inject(ConfigService)
    private configService: ConfigService,
    private mediaService: MediaService,
    private orderItemService: OrderItemService,
    private ownerService: OwnerService,
    private mailService: MailService,
    private mailerService: MailerService,
  ) {
    this.frontEndDomain = configService.getOrThrow('client.domain', {
      infer: true,
    });
  }
  private logger: Logger = new Logger(OrderEventHandler.name);
  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Handle the ORDER_EVENT_CONSTANT.CREATED event.
   * This event is emitted when the OrderService create a new order.
   * @param event - The OrderCreatedEvent payload.
   */
  @OnEvent(ORDER_EVENT_CONSTANT.SUCCESS, { nextTick: true })
  async handle(event: OrderSuccessEvent) {
    try {
      console.log(
        `OrderCreatedEvent: Processing ${event.orderItemIdList.length} order items.`,
      );
      const qrCodeMap = new Map<OrderItemDomain['id'], string>();
      const updateOrderItem: UpdateOrderItemDto[] = await Promise.all(
        event.orderItemIdList.map((item) =>
          this.handleCreateQRCodeAndUploadImage(item, qrCodeMap),
        ),
      );

      const allUpdatedOrder =
        await this.orderItemService.updateManyQRCodeAfterCreated(
          updateOrderItem,
        );
      return this.sendingQrcodeToEmail(allUpdatedOrder, event.email, qrCodeMap);
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async handleCreateQRCodeAndUploadImage(
    orderItem: OrderSuccessEvent['orderItemIdList'][number],
    qrCodeMap: Map<OrderItemDomain['id'], string>,
  ): Promise<UpdateOrderItemDto> {
    try {
      // this.logger.log(`Generate QRCode for OrderItem ID: ${orderItem}`);
      // Check does the id of order item
      // is duplicated.
      if (qrCodeMap.has(orderItem.id))
        throw Error(
          `The qrcode generated for the ID: ${orderItem.id} is duplicated. Please contact developer.`,
        );

      console.log(`Generate QRCode for OrderItem ID: ${orderItem.id}`);
      const qrCodeUrl = `${this.frontEndDomain}/${FRONTEND_PATH.RETRIEVE_ORDER_ITEM}/${orderItem.id}`;
      const { buffer, mimetype } =
        await this.qrCodeService.generateQRCodeAsBuffer(qrCodeUrl);

      const qrcodeImagePath = await this.mediaService.uploadFile({
        file: buffer,
        fileName: `order-item-ID:${orderItem.id}`,
        filePath: null,
        mimeType: mimetype,
        bucketDir: s3BucketDirectory.qrcodeImg,
      });
      console.log(
        `Upload QRCode to S3 for OrderItem ID: ${orderItem.id}. \nIMG url: ${qrcodeImagePath}`,
      );

      qrCodeMap.set(orderItem.id, qrCodeUrl);
      return {
        id: orderItem.id,
        qrcodeImagePath,
      };
    } catch (err) {
      console.error(
        `There is an error while upload image: ${err.message}`,
        err,
      );
    }
  }

  async sendingQrcodeToEmail(
    orderItem: OrderSuccessEvent['orderItemIdList'],
    email: AccountDomain['email'],
    qrCodeMap: Map<OrderItemDomain['id'], string>,
  ) {
    if (qrCodeMap.size !== orderItem.length)
      throw new Error(
        `The QR code generated does not equal to order item. Please contact developer to fix the issue.`,
      );

    const emailTransporter: MailTransporter =
      await this.mailerService.getTransporter();

    let count: 1;
    const total = orderItem.length;
    const orderItemListForMail: OrderItemDetailForMail[] = orderItem.map(
      (item) => {
        if (count > orderItem.length)
          throw new Error(
            `There is an error while preparing data for email sending. Please contact developer to fix the issue.`,
          );
        if (!qrCodeMap.has(item.id))
          throw new Error(
            `There is no generated qrcode for this ID: ${item.id}`,
          );
        const data: OrderItemDetailForMail = {
          ...item,
          qrCodeUrl: qrCodeMap.get(item.id),
          countNumber: count++,
          total,
        };
        return data;
      },
    );

    const owner = await this.ownerService.getOwnerInformation();

    await Promise.all(
      orderItemListForMail.map((item) => {
        this.mailService.orderItem(
          { to: email, data: item },
          owner.name,
          emailTransporter,
        );
      }),
    );
  }
}
