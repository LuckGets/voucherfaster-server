import { HttpException, HttpStatus } from '@nestjs/common';
import { NullAble } from '../utils/types/NullAble.type';
import { HATEOSLink } from './hateos.type';

export class ApiResponse<TData> {
  public timestamp: Date;
  constructor(
    public code: number,
    public message: string,
    public data: NullAble<TData>,
    public links: HATEOSLink,
  ) {
    this.timestamp = new Date(Date.now());
  }

  public static success<TData>(
    message: string,
    links: HATEOSLink,
    data?: TData,
  ): ApiResponse<TData> {
    const resultCode = HttpStatus.OK;
    const responseMessage = message || 'Success.';
    return new ApiResponse(resultCode, responseMessage, data, links);
  }
  public static error<TData>(
    message: string,
    links: HATEOSLink,
    data?: TData,
  ): ApiResponse<TData> {
    const resultCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const responseMessage = message || 'Internal Server Error.';
    return new ApiResponse(resultCode, responseMessage, data, links);
  }
}

export class ErrorApiResponse {
  public static conflictRequest(message?: string) {
    return new HttpException(
      {
        message: message ?? 'Conflict Client Error.',
        timestamp: new Date(Date.now()),
      },
      HttpStatus.CONFLICT,
    );
  }
}
