import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AccountModule } from '@resources/account/account.module';
import { VerifiedAccountGuard } from '../../common/guards/verified-account.guard';
import { VoucherModule } from '@resources/voucher/voucher.module';
import { PackageVoucherModule } from '@resources/package/package.module';
import { UUIDService } from '@utils/services/uuid.service';
import { UsableDaysModule } from '@resources/usable-days/usable-days.module';
import { CalculatorService } from '@utils/services/calculator.service';
import { OrderEventsModule } from './events/order-events.module';
import { RandomCodeGeneratorModule } from '@utils/services/random-code/random-code.module';
import { OrderItemModule } from '@resources/order-item/order-item.module';
import { VoucherRelationalPersistenceModule } from 'src/infrastructure/persistence/voucher/voucher-relational.module';
import { OrderRelationalPersistenceModule } from 'src/infrastructure/persistence/order/order-relational.module';
import { PackageVoucherRelationalPersistenceModule } from 'src/infrastructure/persistence/package/package-relational.module';

@Module({
  imports: [
    OrderRelationalPersistenceModule,
    OrderEventsModule,
    OrderItemModule,
    AccountModule,
    VoucherModule,
    PackageVoucherModule,
    UsableDaysModule,
    RandomCodeGeneratorModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    UUIDService,
    VerifiedAccountGuard,
    CalculatorService,
  ],
})
export class OrderModule {}
