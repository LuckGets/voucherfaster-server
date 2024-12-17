import { HttpException, HttpStatus } from '@nestjs/common';
import { NullAble } from '../utils/types/NullAble.type';
import { HATEOSLink } from './hateos.type';
import { ApiProperty } from '@nestjs/swagger';

export class CoreApiResponse<TData> {
  @ApiProperty({
    type: Number,
    description: 'HTTP status code',
    example: '200',
  })
  public HTTPStatusCode: number;
  @ApiProperty({
    type: String,
    description: 'A response locale timestamp',
    example: '12/16/2024, 4:16:41 PM',
  })
  public timestamp: string | Date;

  @ApiProperty({
    type: String,
    description: 'Response message.',
    example: 'Registered successfully.',
  })
  public message: string;
  @ApiProperty({
    type: Object,
    description: 'The actual response data',
    nullable: true,
  })
  public data: NullAble<TData>;
  @ApiProperty({
    type: Object,
    description: 'Response message.',
    example: '{"login": "/auth/login"}',
  })
  public links: HATEOSLink;
  constructor(
    code: number,
    message: string,
    links: HATEOSLink,
    data?: NullAble<TData>,
  ) {
    this.HTTPStatusCode = code;
    this.message = message;
    this.data = data;
    this.links = links;
    this.timestamp = new Date(Date.now()).toLocaleString();
  }

  public static success<TData>(
    message: string,
    links: HATEOSLink,
    statusCode?: number,
    data?: TData,
  ): CoreApiResponse<TData> {
    const resultCode = statusCode || HttpStatus.OK;
    const responseMessage = message || 'Success.';
    return new CoreApiResponse(resultCode, responseMessage, links, data);
  }
  public static error<TData>(
    message: string,
    links: HATEOSLink,
    statusCode?: number,
    data?: TData,
  ): CoreApiResponse<TData> {
    const resultCode = statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const responseMessage = message || 'Internal Server Error.';
    return new CoreApiResponse(resultCode, responseMessage, links, data);
  }
}

export class ErrorApiResponse {
  public timestamp: string | Date;
  constructor(public message?: string) {
    this.timestamp = new Date(Date.now()).toLocaleString();
    this.message = message;
  }
  public static conflictRequest(message?: string) {
    return new HttpException(
      new ErrorApiResponse(message),
      HttpStatus.CONFLICT,
    );
  }

  public static notFoundRequest(message?: string) {
    return new HttpException(
      new ErrorApiResponse(message),
      HttpStatus.NOT_FOUND,
    );
  }
}
