import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum OwnerImgTypeEnum {
  BACKGROUND = 'BACKGROUND',
  LOGO = 'LOGO',
}

export class OwnerImgDomain {
  id: string;
  imgPath: string;
  type: OwnerImgTypeEnum;
}

export class OwnerDomain {
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: String })
  email: string;
  @Expose({ toClassOnly: true })
  passwordForEmail: string;
  @Expose({ toClassOnly: true })
  passwordForRedeem: string;
  @ApiProperty({ type: String })
  colorCode: string;
  @ApiProperty({ type: [OwnerImgDomain] })
  img: OwnerImgDomain[];
}
