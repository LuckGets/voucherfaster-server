import {
  AccountPath,
  AuthPath,
  VoucherCategoryPath,
} from 'src/config/api-path';
import { HTTPMethod } from './http.type';
import { UUIDTypes } from 'uuid';
import {
  VoucherCategoryDomain,
  VoucherTagDomain,
} from '@resources/voucher/domain/voucher.domain';

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

// export const generateVoucherReponseHATEOASLink = (
//   voucherId: VoucherDomain['id'],
// ) => {
//   return {};
// };

export const generateVoucherCategoryResponseHATEOASLink = (
  voucherCategoryId: VoucherCategoryDomain['id'],
  voucherTagId?: VoucherTagDomain['id'],
) => {
  const links = {
    category: {
      update: {
        method: HTTPMethod.Patch,
        path: `${VoucherCategoryPath.Base}/${voucherCategoryId}`,
      },
    },
    tags: {
      create: {
        method: HTTPMethod.Post,
        path: `${VoucherCategoryPath.Base}/${voucherCategoryId}/${VoucherCategoryPath.TagsName}`,
      },
    },
  };
  if (voucherTagId) {
    links.tags['update'] = {
      method: HTTPMethod.Patch,
      path: `${VoucherCategoryPath.Base}/${voucherCategoryId}/${VoucherCategoryPath.TagsName}/${voucherTagId}`,
    };
  }
  return links;
};

export const generateVoucherTagResponseHATEOASLink = (
  voucherCategoryId: VoucherCategoryDomain['id'],
  voucherTagId: VoucherTagDomain['id'],
) => {
  return {
    tags: {
      create: {
        method: HTTPMethod.Post,
        path: `${VoucherCategoryPath.Base}/${voucherCategoryId}/${VoucherCategoryPath.TagsName}`,
      },
      update: {
        method: HTTPMethod.Patch,
        path: `${VoucherCategoryPath.Base}/${voucherCategoryId}/${VoucherCategoryPath.TagsName}/${voucherTagId}`,
      },
    },
  };
};
