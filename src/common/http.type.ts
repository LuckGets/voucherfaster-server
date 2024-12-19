import { Request } from 'express';

export enum HTTPMethod {
  Get = 'GET',
  Post = 'POST',
  Patch = 'PATCH',
  Put = 'PUT',
  Delete = 'DELETE',
}

export interface HttpRequestWithUser extends Request {
  user: {
    accountId: string;
    role: string;
  };
}
