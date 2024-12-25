import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaS3Service } from './s3/media-s3.service';
import { ConfigModule } from '@nestjs/config';
import mediaS3Config from './s3/media-s3.config';

@Module({
  imports: [ConfigModule.forFeature(mediaS3Config)],
  providers: [
    {
      provide: MediaService,
      useClass: MediaS3Service,
    },
  ],
  exports: [MediaService],
})
export class MediaModule {}
