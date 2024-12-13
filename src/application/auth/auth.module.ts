import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountModule } from '../../resources/account/account.module';
import { AuthStrategyModule } from './strategy/auth-strategy.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [AccountModule],
  providers: [AuthService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
