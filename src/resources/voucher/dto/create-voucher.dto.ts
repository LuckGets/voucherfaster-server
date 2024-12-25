import { CoreApiResponse } from 'src/common/core-api-response';

export class CreateVoucherDto {
  code: string;
  title: string;
  description: string;
  price: number;
  useExpiredTime: Date;
  saleExpiredTime: Date;
  tagId: string;
  termAndCondTh: string[];
  termAndCondEn: string[];
  img?: { file: Buffer; mainImg: boolean }[];
}

export class CreateVoucherResponse extends CoreApiResponse {}
