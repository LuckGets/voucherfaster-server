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
import {
  OrderItemDomain,
  OrderItemPackageDetail,
} from '@resources/order-item/domain/order-item.domain';
import { Transporter } from 'nodemailer';
import { OwnerDomain } from '@resources/owner/domain/owner.domain';
import { HandleBarContextHelper } from './templates/mail-context.helper';
import { NullAble } from '@utils/types/common.type';
import { ObjectHelper } from '@utils/services/object.helper';

export type MailTransporter = Transporter;

export type OrderItemDetailForMail = OrderItemDomain & {
  qrCodeUrl: string;
  countNumber: number;
  total: number;
};

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
    mailData: IMailData<OrderItemDetailForMail>,
    ownerName: OwnerDomain['name'],
    transporter?: MailTransporter,
  ): Promise<void> {
    const { data } = mailData;
    const title = MAIL_ORDER_ITEM_CONSTANT.generateTitle(ownerName, data.code);
    let rewardVoucher: NullAble<OrderItemPackageDetail['rewardVoucher']>;

    if (
      !ObjectHelper.isObjectEmpty(data.detail?.package) &&
      !ObjectHelper.isObjectEmpty(data.detail?.package?.rewardVoucher)
    )
      rewardVoucher = data.detail?.package?.rewardVoucher;
    const isRewardVoucher = data.detail?.package?.rewardVoucher
      ? data.detail
      : null;
    const context = HandleBarContextHelper.orderItem({
      ownerName,
      itemName: data.detail?.title,
      appName: this.appName,
      itemImg: data.detail?.img,
      itemCode: data.code,
      qrcodePath: data.qrcodeImagePath,
      qrcodeUrl: data.qrCodeUrl,
      expiredDate: new Date(data.usableExpiredAt),
      countNumber: data.countNumber,
      total: data.total,
      category: data.detail?.category,
      rewardVoucher: isRewardVoucher,
    });

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
      subject: title,
      context,
    });
    console.log(
      `Sending Order item voucher to email: ${mailData.to} successful!`,
    );
  }
}
