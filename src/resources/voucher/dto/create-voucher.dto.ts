import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';

export class CreateVoucherDto {
  @IsString()
  code: string;
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  usageExpiredTime: Date;
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  saleExpiredTime: Date;
  @IsString()
  tagId: string;
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  termAndCondTh: string[];
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  termAndCondEn: string[];
}

export class CreateVoucherResponse extends CoreApiResponse {}
