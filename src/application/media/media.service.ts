import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class MediaService {
  abstract uploadFile(
    file: Express.Multer.File,
    bucketDir: string,
  ): Promise<string>;
}
