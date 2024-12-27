import { ConfigService } from '@nestjs/config';
import { MediaService } from '../media.service';
import { AllConfigType } from 'src/config/all-config.type';
import * as AWS from '@aws-sdk/client-s3';
import { Inject } from '@nestjs/common';
import { readFile } from 'fs/promises';
import * as path from 'path';

export class MediaS3Service implements MediaService {
  private readonly s3Client: AWS.S3;
  private readonly AWS_BUCKET_NAME: string;
  private readonly CLOUDFRONT_DOMAIN_NAME: string;
  constructor(
    @Inject(ConfigService) private configService: ConfigService<AllConfigType>,
  ) {
    this.s3Client = new AWS.S3({
      region: configService.getOrThrow('media.region', { infer: true }),
      credentials: {
        accessKeyId: configService.getOrThrow('media.accessKey', {
          infer: true,
        }),
        secretAccessKey: configService.getOrThrow('media.secretAcessKey', {
          infer: true,
        }),
      },
    });
    this.AWS_BUCKET_NAME = configService.getOrThrow('media.bucketName', {
      infer: true,
    });
    this.CLOUDFRONT_DOMAIN_NAME = configService.getOrThrow(
      'media.cloudFrontDomainName',
      { infer: true },
    );
  }

  async uploadFile(
    file: Express.Multer.File,
    bucketDir: string,
  ): Promise<string> {
    const filePath = path.resolve(
      process.cwd(),
      `${file.destination}/${file.filename}`,
    );
    const fileKey = `${bucketDir}/${String(file.filename)}`;
    try {
      await this.uploadFileToS3(filePath, fileKey, file.mimetype);
      const linkUrl = `${this.CLOUDFRONT_DOMAIN_NAME}/${fileKey}`;
      return linkUrl;
    } catch (err) {
      console.error(err);
    }
  }

  async uploadFileToS3(
    filePath: string,
    name: string,
    mimetype: string,
  ): Promise<AWS.CompleteMultipartUploadOutput> {
    const buffer = await readFile(filePath);
    const params: AWS.PutObjectCommandInput = {
      Bucket: this.AWS_BUCKET_NAME,
      Key: name,
      ContentType: mimetype,
      Body: buffer,
    };
    const command = new AWS.PutObjectCommand(params);
    return this.s3Client.send(command);
  }

  /**
   *
   * @param imgPath string
   * @returns void
   *
   * Service for deleting the file
   * in the media repository
   */
  async deleteFile(imgPath: string): Promise<void> {
    const params: AWS.DeleteObjectCommandInput = {
      Bucket: this.AWS_BUCKET_NAME,
      Key: imgPath.split(`${this.CLOUDFRONT_DOMAIN_NAME}/`)[1],
    };
    const command = new AWS.DeleteObjectCommand(params);
    await this.s3Client.send(command);
    return;
  }
}
