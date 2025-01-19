import { HttpException, HttpStatus } from '@nestjs/common';
import { HATEOSLink } from './hateos.type';
import { ApiProperty } from '@nestjs/swagger';
import { NullAble } from '@utils/types/common.type';

export class CoreApiResponse {
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
  public data: NullAble<unknown>;
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
    data?: NullAble<unknown>,
  ) {
    this.HTTPStatusCode = code;
    this.message = message;
    this.data = data;
    this.links = links;
    this.timestamp = new Date(Date.now()).toLocaleString();
  }

  public success(
    message: string,
    links: HATEOSLink,
    statusCode?: number,
    data?: unknown,
  ): CoreApiResponse {
    const resultCode = statusCode || HttpStatus.OK;
    const responseMessage = message || 'Success.';
    return new CoreApiResponse(resultCode, responseMessage, links, data);
  }
  public static error(
    message: string,
    links: HATEOSLink,
    statusCode?: number,
    data?: unknown,
  ): CoreApiResponse {
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

  public static badRequest(message?: string) {
    const responseMessage =
      message ??
      'Bad Request due to malsyntax request body or invalid request.';
    return new HttpException(
      new ErrorApiResponse(responseMessage),
      HttpStatus.BAD_REQUEST,
    );
  }

  public static conflictRequest(message?: string) {
    return new HttpException(
      new ErrorApiResponse(message),
      HttpStatus.CONFLICT,
    );
  }

  public static notFoundRequest(message?: string) {
    const responseMessage =
      message || 'The requested resource can not be found on this server.';
    return new HttpException(
      new ErrorApiResponse(responseMessage),
      HttpStatus.NOT_FOUND,
    );
  }

  public static unauthorizedRequest(message?: string) {
    const responseMessage = message || 'This request is not authorized.';
    return new HttpException(
      new ErrorApiResponse(responseMessage),
      HttpStatus.UNAUTHORIZED,
    );
  }

  public static internalServerError(message?: string) {
    const responseMessage =
      message || 'Sorry. There is an internal server error issues.';
    return new HttpException(
      new ErrorApiResponse(responseMessage),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
