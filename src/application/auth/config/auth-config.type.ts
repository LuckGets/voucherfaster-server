export type AuthConfig = {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpireTime: string;
  refreshTokenExpireTime: string;
  bcryptSaltRound: number;
  verifyEmailSecret: string;
  verifyEmailExpiredTime: string;
};
