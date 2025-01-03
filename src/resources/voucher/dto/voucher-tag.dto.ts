import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class CreateVoucherTagDto {
  @ApiProperty({ type: String, examples: ['Breakfast', 'Lunch'] })
  @IsString()
  name: string;
  @ApiProperty({
    type: String,
    example: '0193f3cc-c977-7182-9627-debca7376208',
  })
  @IsUUID(7)
  categoryId: string;
}

export class UpdateVoucherTagDto {
  @ApiProperty({ type: String, examples: ['Breakfast', 'Lunch'] })
  @IsOptional()
  @IsString()
  name?: string;
  @ApiProperty({
    type: String,
    example: '0193f3cc-c977-7182-9627-debca7376208',
  })
  @IsOptional()
  @IsUUID(7)
  updateCategoryId?: string;
  @IsUUID(7)
  tagId: string;
}

export class VoucherTagResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.OK,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Account details for account id 123',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    example: `{"logout": ${AuthPath.Logout}}`,
  })
  public links: HATEOSLink;
  @ApiProperty({
    type: Object,
    example: 'sdfsdf',
  })
  public data: unknown;

  public static success(
    data: unknown,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): VoucherTagResponse {
    const responseMessage = message ?? 'Login Successfully';
    const responseCode = statusCode ?? HttpStatus.ACCEPTED;
    const responseLink = links;
    return new VoucherTagResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }

  public static createSuccess(
    data: unknown,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): VoucherTagResponse {
    const responseMessage = message ?? 'Create voucher tag Successfully';
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    // GenerateAccountResponseHATEOASLink(
    //   data.id as UUIDTypes,
    //   !!data.verifiedAt,
    // );
    return new VoucherTagResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
