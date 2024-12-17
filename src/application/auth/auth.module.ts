import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountModule } from '../../resources/account/account.module';
import { JwtModule } from '@nestjs/jwt';
import { CryptoService } from '@utils/services/crypto.service';
import { MailModule } from '@application/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import authConfig from './config/auth.config';

@Module({
  imports: [
    AccountModule,
    JwtModule.register({}),
    CryptoService,
    MailModule,
    ConfigModule.forFeature(authConfig),
  ],
  providers: [AuthService, CryptoService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
