import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';
import { OrderItemDomain } from './order-item.domain';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import { UsableDaysAfterPurchasedDomain } from '@resources/usable-days/domain/usable-day.domain';
import { AccountDomain } from '@resources/account/domain/account.domain';

export class OrderDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  totalPrice: string;
  @ApiProperty({ type: () => Date })
  usableDay: Date;
  @ApiProperty({ type: String })
  accountId: AccountDomain['id'];
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  updatedAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  deletedAt?: Date;
  @ApiProperty({ type: () => TransactionDomain })
  transaction?: TransactionDomain;
  @ApiProperty({ type: () => [OrderItemDomain] })
  orderItems?: OrderItemDomain[];
}
