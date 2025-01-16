import { ApiProperty } from '@nestjs/swagger';

export class UsableDaysAfterPurchasedDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  usableDays: number;
  @ApiProperty({ type: Date })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  updatedAt?: Date;
  @ApiProperty({ type: Date })
  deletedAt?: Date;
}
