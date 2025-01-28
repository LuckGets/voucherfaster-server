import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { VoucherRelationalPersistenceModule } from 'src/infrastructure/persistence/voucher/voucher-relational.module';
import { UUIDService } from '@utils/services/uuid.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MediaModule } from '@application/media/media.module';
import { UnlinkFileInterceptor } from 'src/common/interceptor/unlink-file.interceptor';
import { MULTER_UPLOAD_CONSTANT } from 'src/config/upload.config';
import { CompactService } from 'src/common/service/compact.service';
import { ProductDomainHelper } from 'src/common/product.helper';
import { CategoryModule } from '@resources/category/category.module';

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
    CategoryModule,
  ],
  controllers: [VoucherController],
  providers: [
    VoucherService,
    UUIDService,
    UnlinkFileInterceptor,
    CompactService,
    ProductDomainHelper,
  ],
  exports: [VoucherService],
})
export class VoucherModule {}
