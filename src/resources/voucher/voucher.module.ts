import { Module } from '@nestjs/common';
import { VoucherController } from './controllers/voucher.controller';
import { VoucherService } from './voucher.service';
import { VoucherRelationalPersistenceModule } from 'src/infrastructure/persistence/voucher/voucher-relational.module';
import { UUIDService } from '@utils/services/uuid.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MediaModule } from '@application/media/media.module';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { VoucherCategoryController } from './controllers/voucher-category.controller';
import { VoucherPromotionController } from './controllers/voucher-promotion.controller';
import { MULTER_UPLOAD_CONSTANT } from 'src/config/upload.config';

@Module({
  imports: [
    VoucherRelationalPersistenceModule,
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
  ],
  controllers: [
    VoucherController,
    VoucherCategoryController,
    VoucherPromotionController,
  ],
  providers: [VoucherService, UUIDService, UnlinkFileInterceptor],
  exports: [VoucherService],
})
export class VoucherModule {}
