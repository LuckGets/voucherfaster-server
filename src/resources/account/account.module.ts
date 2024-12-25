import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRelationalPersistenceModule } from '../../infrastructure/persistence/account/account-relational.module';
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard';
import { CryptoService } from '@utils/services/crypto.service';
import { ConfigModule } from '@nestjs/config';
import authConfig from '@application/auth/config/auth.config';
import { MailModule } from '@application/mail/mail.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MediaModule } from '@application/media/media.module';

@Module({
  imports: [
    AccountRelationalPersistenceModule,
    ConfigModule.forFeature(authConfig),
    MulterModule.register({
      storage: diskStorage({
        destination: './upload',
        filename(req, file, callback) {
          const filename = `${Date.now()}_${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
    MailModule,
    MediaModule,
  ],
  controllers: [AccountController],
  providers: [AccountService, AccessTokenAuthGuard, CryptoService],
  exports: [AccountService],
})
export class AccountModule {}
