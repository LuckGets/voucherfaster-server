import { Request } from 'express';

export interface RequestGoogleUser extends Request {
  user: {
    socialId: string;
    fullname: string;
    email: string;
    photo: string;
    accountProvider: string;
    accessToken: string;
  };
}
