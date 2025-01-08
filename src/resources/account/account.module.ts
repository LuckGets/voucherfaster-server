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
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { MULTER_UPLOAD_CONSTANT } from 'src/config/upload.config';

@Module({
  imports: [
    AccountRelationalPersistenceModule,
    ConfigModule.forFeature(authConfig),
    MulterModule.register({
      storage: diskStorage({
        destination: MULTER_UPLOAD_CONSTANT.DIRECTORY,
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
  providers: [
    AccountService,
    AccessTokenAuthGuard,
    CryptoService,
    UnlinkFileInterceptor,
  ],
  exports: [AccountService],
})
export class AccountModule {}
