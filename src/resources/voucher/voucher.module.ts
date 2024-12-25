import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { VoucherRelationalRepositoryModule } from 'src/infrastructure/persistence/voucher/voucher-relational.module';
import { UUIDService } from '@utils/services/uuid.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MediaModule } from '@application/media/media.module';

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
  controllers: [VoucherController],
  providers: [VoucherService, UUIDService],
})
export class VoucherModule {}