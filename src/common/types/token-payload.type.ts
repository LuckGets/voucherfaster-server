export type JwtPayloadType = {
  sub: string;
  role: string;
};

export type RefreshTokenPayloadType = {
  sub: string;
};

export type VerifyTokenPayloadType = {
  sub: string;
  newPassword?: string;
};
