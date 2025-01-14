import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRelationalRepositoryModule } from 'src/infrastructure/persistence/order/order-relational.module';
import { AccountModule } from '@resources/account/account.module';
import { VerifiedAccountGuard } from './guards/verified-account.guard';
import { VoucherModule } from '@resources/voucher/voucher.module';
import { PackageVoucherModule } from '@resources/package/package.module';

@Module({
  imports: [
    OrderRelationalRepositoryModule,
    AccountModule,
    VoucherModule,
    PackageVoucherModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, VerifiedAccountGuard],
})
export class OrderModule {}
