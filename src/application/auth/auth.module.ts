import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountModule } from '../../resources/account/account.module';
import { JwtModule } from '@nestjs/jwt';
import { CryptoService } from '@utils/services/crypto.service';
import { MailModule } from '@application/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import authConfig from './config/auth.config';
import { UUIDService } from '@utils/services/uuid.service';
import { SessionModule } from '@resources/session/session.module';
import { RefreshTokenAuthGuard } from './auth.guard';

@Module({
  imports: [
    AccountModule,
    JwtModule.register({}),
    MailModule,
    ConfigModule.forFeature(authConfig),
    SessionModule,
  ],
  providers: [AuthService, CryptoService, UUIDService, RefreshTokenAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
