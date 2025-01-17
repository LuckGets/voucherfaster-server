import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class MediaService {
  abstract uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    bucketDir: string,
  ): Promise<string>;
  abstract deleteFile(imgPath: string): Promise<void>;
}
