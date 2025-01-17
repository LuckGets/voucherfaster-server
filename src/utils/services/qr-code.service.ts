import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QRCodeService {
  public async generateQRCodeAsBuffer(
    urlData: string,
  ): Promise<{ buffer: Buffer; mimetype: string }> {
    const buffer = await QRCode.toBuffer(urlData);
    return { buffer, mimetype: 'image/png' };
  }
}
