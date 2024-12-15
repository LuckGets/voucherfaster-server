import { Module } from '@nestjs/common';
import { AuthGoogleController } from './auth-google.controller';
import { GoogleStrategy } from './strategy/auth-google.strategy';
import { ConfigModule } from '@nestjs/config';
import authGoogleConfig from './config/auth-google.config';
import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../../resources/account/account.module';

@Module({
  imports: [
    ConfigModule.forFeature(authGoogleConfig),
    AuthModule,
    AccountModule,
  ],
  controllers: [AuthGoogleController],
  providers: [GoogleStrategy],
})
export class AuthGoogleModule {}
