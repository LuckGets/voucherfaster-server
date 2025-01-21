import { ApiProperty } from '@nestjs/swagger';
import { OrderDomain } from '@resources/order/domain/order.domain';
import { IsString, IsUUID } from 'class-validator';

export class ProcessPaymentDto {
  @IsUUID(7)
  @ApiProperty({ type: () => String })
  orderId: OrderDomain['id'];

  @IsString()
  paymentToken: string;
}
