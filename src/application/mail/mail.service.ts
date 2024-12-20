import { MailerService } from '@application/mailer/mailer.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { IMailData } from './mail-data.interface';
import * as path from 'path';
import {
  CHANGE_PASSWORD_CONSTANT,
  VERIFY_EMAIL_CONSTANT,
} from './config/mail.constant';

@Injectable()
export class MailService {
  private basePath: string;
  private appName: string;
  private clientDomain: string;
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService<AllConfigType>,
  ) {
    this.basePath =
      configService.get('app.workingDir', { infer: true }) ?? process.cwd();
    this.appName =
      configService.get('app.name', { infer: true }) ?? 'Voucher Faster';
    this.clientDomain = configService.get('client.domain', {
      infer: true,
    });
  }

  async verifyEmail(mailData: IMailData<{ token: string }>): Promise<void> {
    const verifyEmailPath = this.configService.get('client.verifyEmailPath', {
      infer: true,
    });
    const url = new URL(`${this.clientDomain}${verifyEmailPath}`);
    url.searchParams.set('hash', mailData.data.token);
    await this.mailerService.sendMail({
      templatePath: path.join(
        this.basePath,
        'src',
        'application',
        'mail',
        'templates',
        'verify.hbs',
      ),
      to: mailData.to,
      subject: VERIFY_EMAIL_CONSTANT.title,
      context: {
        title: VERIFY_EMAIL_CONSTANT.title,
        app_name: this.appName,
        actionTitle: VERIFY_EMAIL_CONSTANT.actionTitle,
        text1: VERIFY_EMAIL_CONSTANT.firstText,
        text2: VERIFY_EMAIL_CONSTANT.secondText,
        text3: VERIFY_EMAIL_CONSTANT.thirdText,
        url,
      },
    });
  }

  async changePassword(mailData: IMailData<{ token: string }>): Promise<void> {
    const changePasswordPath = this.configService.get(
      'client.changePasswordPath',
      {
        infer: true,
      },
    );
    const url = new URL(`${this.clientDomain}${changePasswordPath}`);
    url.searchParams.set('hash', mailData.data.token);
    await this.mailerService.sendMail({
      templatePath: path.join(
        this.basePath,
        'src',
        'application',
        'mail',
        'templates',
        'verify.hbs',
      ),
      to: mailData.to,
      subject: CHANGE_PASSWORD_CONSTANT.title,
      context: {
        title: CHANGE_PASSWORD_CONSTANT.title,
        app_name: this.appName,
        actionTitle: CHANGE_PASSWORD_CONSTANT.actionTitle,
        text1: CHANGE_PASSWORD_CONSTANT.firstText,
        text2: CHANGE_PASSWORD_CONSTANT.secondText,
        text3: CHANGE_PASSWORD_CONSTANT.thirdText,
        url,
      },
    });
  }
}
