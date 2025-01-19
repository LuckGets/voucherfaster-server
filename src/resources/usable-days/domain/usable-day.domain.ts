import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UsableDaysAfterPurchasedDomain {
  @ApiProperty({ type: String })
  @Expose({ toClassOnly: true })
  id: string;
  @ApiProperty({ type: String })
  usableDays: number;
  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ toClassOnly: true })
  deletedAt?: Date;
}
