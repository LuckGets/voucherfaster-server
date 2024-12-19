import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRelationalPersistenceModule } from '../../infrastructure/persistence/account/account-relational.module';
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard';
import { CryptoService } from '@utils/services/crypto.service';
import { ConfigModule } from '@nestjs/config';
import authConfig from '@application/auth/config/auth.config';

@Module({
  imports: [
    AccountRelationalPersistenceModule,
    ConfigModule.forFeature(authConfig),
  ],
  controllers: [AccountController],
  providers: [AccountService, AccessTokenAuthGuard, CryptoService],
  exports: [AccountService],
})
export class AccountModule {}
