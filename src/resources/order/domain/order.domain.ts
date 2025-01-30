import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { Expose } from 'class-transformer';
import { OrderItemDomain } from '../../order-item/domain/order-item.domain';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import { AccountDomain } from '@resources/account/domain/account.domain';

export class OrderDomain {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  totalPrice: number;
  @ApiProperty({ type: String })
  account: Pick<
    AccountDomain,
    'id' | 'fullname' | 'email' | 'phone' | 'verifiedAt' | 'role'
  >;
  @ApiProperty({ type: Date })
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

  constructor({
    id,
    totalPrice,
    account,
    createdAt,
    updatedAt,
    deletedAt,
    transaction,
    orderItems,
  }: {
    id: OrderDomain['id'];
    totalPrice: OrderDomain['totalPrice'];
    account: OrderDomain['account'];
    createdAt?: OrderDomain['createdAt'];
    updatedAt?: OrderDomain['updatedAt'];
    deletedAt?: OrderDomain['deletedAt'];
    transaction?: OrderDomain['transaction'];
    orderItems?: OrderDomain['orderItems'];
  }) {
    this.id = id;
    this.totalPrice = totalPrice;
    this.account = account;
    this.createdAt = createdAt ?? null;
    this.updatedAt = updatedAt ?? null;
    this.deletedAt = deletedAt ?? null;
    this.transaction = transaction;
    this.orderItems = orderItems;
  }
}
