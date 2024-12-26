import { ApiProperty } from '@nestjs/swagger';
import { VoucherDomain } from '../domain/voucher.domain';

export class AddVoucherImgDto {
  @ApiProperty({ type: String })
  voucherId: VoucherDomain['id'];
  @ApiProperty({
    description:
      'If this property have truthy value. The main img will be delete and not be use as the ordinary image.',
  })
  deletedMainImg?: boolean;
}

export class UpdateVoucherImgDto {
  @ApiProperty({ type: String })
  voucherId: VoucherDomain['id'];
  @ApiProperty({
    description:
      'If this property have truthy value. The main img will be delete and not be use as the ordinary image.',
  })
  deletedMainImg?: boolean;
}
