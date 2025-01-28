import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherTagDomain } from '@resources/category/domain/tag.domain';
import { AtLeastOneProperty } from '@utils/validators/AtleastOneProp';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CoreApiResponse } from 'src/common/core-api-response';
import { HATEOSLink } from 'src/common/hateos.type';
import { AuthPath } from 'src/config/api-path';

@AtLeastOneProperty(UpdateVoucherTagDto.updatAbleFields())
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

  public static updatAbleFields(): Array<keyof UpdateVoucherTagDto> {
    return ['name', 'updateCategoryId'];
  }
}

export class UpdateVoucherTagResponse extends CoreApiResponse {
  @ApiProperty({
    type: Number,
    example: HttpStatus.CREATED,
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: Number,
    example: 'Update voucher tag ID: 1224 successfully.',
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
    code: UpdateVoucherTagResponse['HTTPStatusCode'],
    message: UpdateVoucherTagResponse['message'],
    link: UpdateVoucherTagResponse['links'],
    data: UpdateVoucherTagResponse['data'],
  ) {
    super(code, message, link);
    this.data = data;
  }

  public static success(
    data: VoucherTagDomain,
    message?: string,
    links?: HATEOSLink,
    statusCode?: number,
  ): UpdateVoucherTagResponse {
    const responseMessage =
      message ?? `Update voucher tag ID: ${data.id} successfully.`;
    const responseCode = statusCode ?? HttpStatus.OK;
    const responseLink = links;
    return new UpdateVoucherTagResponse(
      responseCode,
      responseMessage,
      responseLink,
      data,
    );
  }
}
