import { AccountPath, AuthPath } from 'src/config/api-path';
import { HTTPMethod } from './http.type';
import { UUIDTypes } from 'uuid';

const generateVerfifiedAccountLink = (accountId: string) => ({
  account: {
    update: {
      method: HTTPMethod.Patch,
      path: `${AccountPath.Base}/${accountId}`,
    },
    changePassword: {
      method: HTTPMethod.Patch,
      path: `${AccountPath.Base}/${accountId}/${AccountPath.ChangePassword.split('/')[1]}`,
    },
    logout: {
      method: HTTPMethod.Get,
      path: `${AuthPath.Base}${AuthPath.Logout}`,
    },
    me: {
      method: HTTPMethod.Get,
      path: `${AuthPath.Base}${AccountPath.Me}`,
    },
  },
  order: {},
});

export const GenerateAccountResponseHATEOASLink = (
  accountId: UUIDTypes | string,
  verify: boolean,
) => {
  const links = generateVerfifiedAccountLink(String(accountId));
  return verify
    ? links
    : {
        ...links,
        account: {
          ...links.account,
          reVerify: {
            method: HTTPMethod.Get,
            path: `${AccountPath.Base}/${accountId}/${AccountPath.Verify.split('/')[1]}`,
          },
        },
      };
};
