import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AccountModule } from '@resources/account/account.module';
import { VerifiedAccountGuard } from '../../common/guards/verified-account.guard';
import { VoucherModule } from '@resources/voucher/voucher.module';
import { PackageVoucherModule } from '@resources/package/package.module';
import { UUIDService } from '@utils/services/uuid.service';
import { CalculatorService } from '@utils/services/calculator.service';
import { OrderEventsModule } from './events/order-events.module';
import { RandomCodeGeneratorModule } from '@utils/services/random-code/random-code.module';
import { OrderItemModule } from '@resources/order-item/order-item.module';
import { OrderRelationalPersistenceModule } from 'src/infrastructure/persistence/order/order-relational.module';
import { TransactionModule } from '@resources/transaction/transaction.module';
import { ProductDomainHelper } from 'src/common/product.helper';

@Module({
  imports: [
    OrderRelationalPersistenceModule,
    OrderEventsModule,
    TransactionModule,
    OrderItemModule,
    AccountModule,
    VoucherModule,
    PackageVoucherModule,
    RandomCodeGeneratorModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    UUIDService,
    VerifiedAccountGuard,
    CalculatorService,
    ProductDomainHelper,
  ],
})
export class OrderModule {}
