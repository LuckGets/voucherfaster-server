import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRelationalPersistenceModule } from '../../infrastructure/persistence/account/account-relational.module';

@Module({
  imports: [AccountRelationalPersistenceModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
