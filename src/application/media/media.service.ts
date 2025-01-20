import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class MediaService {
  abstract uploadFile({
    file,
    fileName,
    filePath,
    mimeType,
    bucketDir,
  }: {
    file: Buffer;
    fileName: string;
    filePath: string;
    mimeType: string;
    bucketDir: string;
  }): Promise<string>;
  abstract deleteFile(imgPath: string): Promise<void>;
}
