import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import clientConfig from 'src/config/client/client.config';
import { QRCodeService } from '@utils/services/qr-code.service';
import { MediaModule } from '@application/media/media.module';
import { OrderItemModule } from '@resources/order-item/order-item.module';
import { OrderEventHandler } from './order-event.handler';

@Module({
  imports: [
    ConfigModule.forFeature(clientConfig),
    MediaModule,
    OrderItemModule,
  ],
  providers: [OrderEventHandler, QRCodeService],
  exports: [OrderEventHandler],
})
export class OrderEventsModule {}
