import { IsOptional, IsUUID } from 'class-validator';

export class UpdateOrderItemDto {
  @IsUUID()
  id: string;
  @IsOptional()
  qrcodeImagePath?: string;
  @IsOptional()
  redeemedAt?: Date;
}
