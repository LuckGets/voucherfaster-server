import { ApiProperty } from '@nestjs/swagger';

export class VoucherUsageDaysDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  usageDays: number;
  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  @ApiProperty({ type: Date })
  deletedAt?: Date;
}
