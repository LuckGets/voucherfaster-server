import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './application//auth/auth.module';
import { AccountModule } from './resources/account/account.module';
import appConfig from './config/app.config';
import { CustomValidatorModule } from './utils/validators/custom-validators.module';
import { AuthGoogleModule } from './application/auth-google/auth-google.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./.env.development'],
      load: [appConfig],
    }),
    AuthModule,
    AccountModule,
    CustomValidatorModule,
    AuthGoogleModule,
  ],
})
export class AppModule {}
