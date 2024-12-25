import { registerAs } from '@nestjs/config';
import validateConfig from '@utils/validateConfig';
import { IsString, MinLength } from 'class-validator';
import { AllConfigTypeEnum } from 'src/config/all-config.type';

export type MediaConfig = {
  bucketName: string;
  accessKey: string;
  secretAcessKey: string;
  region: string;
  cloudFrontDomainName: string;
};

class EnvironmentMediaVarValidator {
  @IsString()
  AMAZON_S3_BUCKET_NAME: string;
  @IsString()
  @MinLength(8)
  AMAZON_S3_ACCESS_KEY: string;
  @IsString()
  @MinLength(8)
  AMAZON_S3_SECRET_ACCESS_KEY: string;
  @IsString()
  AMAZON_CLOUDFRONT_DOMAIN_NAME: string;
}

export default registerAs<MediaConfig>(AllConfigTypeEnum.Media, () => {
  validateConfig(process.env, EnvironmentMediaVarValidator);

  return {
    accessKey: process.env.AMAZON_S3_ACCESS_KEY,
    secretAcessKey: process.env.AMAZON_S3_SECRET_ACCESS_KEY,
    region: process.env.AMAZON_S3_REGION || 'SINGAPORE',
    bucketName: process.env.AMAZON_S3_BUCKET_NAME,
    cloudFrontDomainName: process.env.AMAZON_CLOUDFRONT_DOMAIN_NAME,
  };
});
