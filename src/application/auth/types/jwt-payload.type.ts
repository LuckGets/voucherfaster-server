export type JwtPayloadType = {
  sub: {
    accountId: string;
    role: string;
  };
};

export type RefreshTokenPayloadType = {
  sub: {
    accountId: string;
  };
};
