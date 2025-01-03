import { Module } from '@nestjs/common';
import { VoucherController } from './controllers/voucher.controller';
import { VoucherService } from './voucher.service';
import { VoucherRelationalRepositoryModule } from 'src/infrastructure/persistence/voucher/voucher-relational.module';
import { UUIDService } from '@utils/services/uuid.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MediaModule } from '@application/media/media.module';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { VoucherCategoryController } from './controllers/voucher-category.controller';

@Module({
  imports: [
    VoucherRelationalRepositoryModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './upload',
        filename(req, file, callback) {
          const filename = `${Date.now()}_${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
    MediaModule,
  ],
  controllers: [VoucherController, VoucherCategoryController],
  providers: [VoucherService, UUIDService, UnlinkFileInterceptor],
})
export class VoucherModule {}
