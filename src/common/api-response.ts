import { HttpStatus } from '@nestjs/common';
import { NullAble } from '../utils/types/NullAble.type';

export class ApiResponse<TData> {
  public timestamp: Date;
  constructor(
    public code: number,
    public message: string,
    public data: NullAble<TData>,
  ) {
    this.timestamp = new Date(Date.now());
  }

  public static success<TData>(
    message: string,
    data?: TData,
  ): ApiResponse<TData> {
    const resultCode = HttpStatus.OK;
    const responseMessage = message || 'Success.';
    return new ApiResponse(resultCode, responseMessage, data);
  }
  public static error<TData>(
    message: string,
    data?: TData,
  ): ApiResponse<TData> {
    const resultCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const responseMessage = message || 'Internal Server Error.';
    return new ApiResponse(resultCode, responseMessage, data);
  }
}
