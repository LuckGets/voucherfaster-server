import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './application//auth/auth.module';
import { AccountModule } from './resources/account/account.module';
import appConfig from './config/app.config';
import { PrismaModule } from './infrastructure/persistence/config/prisma.module';
import { CustomValidatorModule } from './utils/validators/custom-validators.module';
import authConfig from './application/auth/config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./.env.development'],
      load: [appConfig, authConfig],
    }),
    AuthModule,
    AccountModule,
    CustomValidatorModule,
    // PrismaModule
  ],
})
export class AppModule {}
