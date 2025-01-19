import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum OwnerImgTypeEnum {
  BACKGROUND = 'BACKGROUND',
  LOGO = 'LOGO',
}

export class OwnerImgDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  imgPath: string;
  @ApiProperty({ type: () => OwnerImgTypeEnum })
  type: OwnerImgTypeEnum;
  @ApiProperty({ type: () => Date })
  createdAt: Date;
  @ApiProperty({ type: () => Date })
  updatedAt: Date;
}

export class OwnerDomain {
  id?: string;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: String })
  emailForSendNotification: string;
  @Expose({ toClassOnly: true })
  passwordForEmail: string;
  @Expose({ toClassOnly: true })
  passwordForRedeem: string;
  @ApiProperty({ type: String })
  colorCode: string;
  @ApiProperty({ type: [OwnerImgDomain] })
  img: OwnerImgDomain[];
}
