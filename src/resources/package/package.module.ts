import { Logger, Module } from '@nestjs/common';
import { PackageVoucherController } from './package.controller';
import { PackageVoucherService } from './package.service';
import { PackageVoucherRelationalPersistenceModule } from 'src/infrastructure/persistence/package/package-relational.module';
import { VoucherModule } from '@resources/voucher/voucher.module';
import { UUIDService } from '@utils/services/uuid.service';
import { MediaModule } from '@application/media/media.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MULTER_UPLOAD_CONSTANT } from 'src/config/upload.config';
import { PackageVoucherRepository } from 'src/infrastructure/persistence/package/package.repository';
import { PackageImgRepository } from 'src/infrastructure/persistence/package/package-img.repository';

@Module({
  imports: [
    PackageVoucherRelationalPersistenceModule,
    VoucherModule,
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
  controllers: [PackageVoucherController],
  providers: [PackageVoucherService, Logger, UUIDService],
  exports: [PackageVoucherService],
})
export class PackageVoucherModule {}
