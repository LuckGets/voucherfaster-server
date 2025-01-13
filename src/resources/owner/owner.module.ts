import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { OwnerRelationalRepositoryModule } from 'src/infrastructure/persistence/owner/owner-relational.module';
import { CryptoService } from '@utils/services/crypto.service';
import { ConfigModule } from '@nestjs/config';
import mailConfig from '@application/mail/config/mail.config';
import { MediaModule } from '@application/media/media.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MULTER_UPLOAD_CONSTANT } from 'src/config/upload.config';

@Module({
  imports: [
    ConfigModule.forFeature(mailConfig),
    MulterModule.register({
      storage: diskStorage({
        destination: MULTER_UPLOAD_CONSTANT.DIRECTORY,
        filename(req, file, callback) {
          const filename = `${Date.now()}_${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
    MediaModule,
    OwnerRelationalRepositoryModule,
  ],
  controllers: [OwnerController, CryptoService],
  providers: [OwnerService],
})
export class OwnerModule {}
