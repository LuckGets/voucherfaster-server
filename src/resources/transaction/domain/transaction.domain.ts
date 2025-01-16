import { ApiProperty } from '@nestjs/swagger';

export type TransactionStatusEnum = 'PENDING' | 'SUCCESS' | 'FAILED';

export class TransactionDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ enum: ['PENDING', 'SUCCESS', 'FAILED'] })
  status: TransactionStatusEnum;
  @ApiProperty({ type: String })
  transactionSystem: string;
  @ApiProperty({ type: String })
  paymentId?: string;
  @ApiProperty({ type: Date })
  createdAt: Date;
  @ApiProperty({ type: Date })
  updatedAt: Date;
  @ApiProperty({ type: Date, nullable: true })
  deletedAt?: Date;
}
