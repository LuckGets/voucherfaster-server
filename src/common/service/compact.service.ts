import { Injectable } from '@nestjs/common';

@Injectable()
export class CompactService {
  public compactUUIDtoBase64(uuid: string) {
    return Buffer.from(uuid, 'binary').toString('base64');
  }

  public compactBase64toUUID(base64: string) {
    return Buffer.from(base64, 'base64').toString('binary');
  }
}
