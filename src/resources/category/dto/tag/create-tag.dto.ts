import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

export class CreateVoucherTagDto {
  id?: VoucherTagDomain['id'];
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

export class CreateVoucherTagResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Create new voucher tag name: ไก่ทอด successfully.',
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
  public data: VoucherTagDomain;

  constructor(
    code: CreateVoucherTagResponse['HTTPStatusCode'],
    message: CreateVoucherTagResponse['message'],
    link: CreateVoucherTagResponse['links'],
    data: CreateVoucherTagResponse['data'],
  ) {
    super(code, message, link);
    this.data = data;
  }

  public static success(
    data: VoucherTagDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): CreateVoucherTagResponse {
    const responseMessage =
      message ?? `Create new voucher tag name: ${data.name} successfully.`;
    const responseCode = statusCode ?? HttpStatus.CREATED;
    const responseLink = links;
    return new CreateVoucherTagResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
