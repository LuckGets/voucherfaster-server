import { Module } from '@nestjs/common';
import { OrderCreatedHandler } from './order-created.handler';
import { ConfigModule } from '@nestjs/config';
import clientConfig from 'src/config/client/client.config';
import { QRCodeService } from '@utils/services/qr-code.service';
import { MediaModule } from '@application/media/media.module';
import { OrderItemModule } from '@resources/order-item/order-item.module';

@Module({
  imports: [
    ConfigModule.forFeature(clientConfig),
    MediaModule,
    OrderItemModule,
  ],
  providers: [OrderCreatedHandler, QRCodeService],
  exports: [OrderCreatedHandler],
})
export class OrderEventsModule {}
