import { MailerService } from '@application/mailer/mailer.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { IMailData } from './mail-data.interface';
import * as path from 'path';
import { VERIFY_EMAIL_CONSTANT } from './config/mail.constant';

@Injectable()
export class MailService {
  private basePath: string;
  private appName: string;
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService<AllConfigType>,
  ) {
    this.basePath =
      configService.get('app.workingDir', { infer: true }) ?? process.cwd();
    this.appName =
      configService.get('app.name', { infer: true }) ?? 'Voucher Faster';
  }

  async verifyEmail(mailData: IMailData<{ hash: string }>): Promise<void> {
    const clientDomain = this.configService.get('client.domain', {
      infer: true,
    });
    const verifyEmailPath = this.configService.get('client.verifyEmailPath', {
      infer: true,
    });
    const url = new URL(`${clientDomain}${verifyEmailPath}`);
    url.searchParams.set('hash', mailData.data.hash);
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
}
