import { Request } from 'express';
import { Role } from '@resources/account/types/account.type';

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
    role: Role;
  };
}
