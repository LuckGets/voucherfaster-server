import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';
import { OrderItemDomain } from './order-item.domain';

export class OrderDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  totalPrice: string;
  usableDay: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  createdAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  updatedAt?: Date;
  @ApiProperty({ type: Date })
  @Expose({ groups: [RoleEnum.Admin] })
  deletedAt?: Date;
  @ApiProperty({ type: Date })
  transaction: string;
  @ApiProperty({ type: () => [OrderItemDomain] })
  items: OrderItemDomain[];
}
