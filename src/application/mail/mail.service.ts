import { MailerService } from '@application/mailer/mailer.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import { IMailData } from './mail-data.interface';
import * as path from 'path';
import {
  CHANGE_PASSWORD_CONSTANT,
  MAIL_ORDER_ITEM_CONSTANT,
  VERIFY_EMAIL_CONSTANT,
} from './config/mail.constant';
import { OrderItemDomain } from '@resources/order/domain/order-item.domain';
import { Transporter } from 'nodemailer';

export type MailTransporter = Transporter;

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

  async verifyEmail(
    mailData: IMailData<{ token: string }>,
    transporter?: MailTransporter,
  ): Promise<void> {
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
      transporter,
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

  async changePassword(
    mailData: IMailData<{ token: string }>,
    transporter?: MailTransporter,
  ): Promise<void> {
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
      transporter,
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

  async orderItem(
    mailData: IMailData<OrderItemDomain>,
    transporter?: MailTransporter,
  ): Promise<void> {
    const { data } = mailData;

    console.log(`Sending Order item voucher to email: ${mailData.to}...`);
    await this.mailerService.sendMail({
      templatePath: path.join(
        this.basePath,
        'src',
        'application',
        'mail',
        'templates',
        'order-item.hbs',
      ),
      transporter,
      to: mailData.to,
      subject: MAIL_ORDER_ITEM_CONSTANT.title,
      context: {
        title: MAIL_ORDER_ITEM_CONSTANT.title,
        app_name: this.appName,
        item_name: data.detail.title,
        item_code: data.code,
        qrcode_path: data.qrcodeImagePath,
        expired_time: data.detail.usageExpiredTime,
      },
    });
    console.log(
      `Sending Order item voucher to email: ${mailData.to} successful!`,
    );
  }
}
