import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './application//auth/auth.module';
import { AccountModule } from './resources/account/account.module';
import appConfig from './config/app.config';
import { CustomValidatorModule } from './utils/validators/custom-validators.module';
import { AuthGoogleModule } from './application/auth-google/auth-google.module';
import { SessionModule } from './resources/session/session.module';
import clientConfig from './config/client/client.config';
import { JwtModule } from '@nestjs/jwt';
import { VoucherModule } from './resources/voucher/voucher.module';
import { PackageVoucherModule } from '@resources/package/package.module';
import { OrderModule } from './resources/order/order.module';
import { TransactionModule } from './resources/transaction/transaction.module';
import { UsableDaysModule } from './resources/usable-days/usable-days.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./.env.development'],
      load: [appConfig, clientConfig],
    }),
    JwtModule.register({ global: true }),
    AuthModule,
    AccountModule,
    CustomValidatorModule,
    AuthGoogleModule,
    SessionModule,
    VoucherModule,
    PackageVoucherModule,
    OrderModule,
    TransactionModule,
    UsableDaysModule,
  ],
})
export class AppModule {}
