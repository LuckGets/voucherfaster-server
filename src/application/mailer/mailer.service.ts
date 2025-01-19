import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import * as fs from 'fs/promises';
import Handlebars from 'handlebars';
import { OwnerService } from '@resources/owner/owner.service';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  constructor(
    private configService: ConfigService<AllConfigType>,
    private ownerService: OwnerService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('mail.host', { infer: true }),
      port: configService.get('mail.port', { infer: true }),
      secure: configService.get('mail.secure', { infer: true }),
      auth: {
        user: configService.get('mail.user', { infer: true }),
        pass: configService.get('mail.password', { infer: true }),
      },
      debug: true,
    });
  }

  async getTransporter(): Promise<nodemailer.Transporter> {
    try {
      const ownerEmailInfo = await this.ownerService.getEmailInformation();
      const transporter = nodemailer.createTransport({
        host: this.configService.get('mail.host', { infer: true }),
        port: this.configService.get('mail.port', { infer: true }),
        secure: this.configService.get('mail.secure', { infer: true }),
        auth: {
          user: ownerEmailInfo.emailForSendNotification,
          pass: ownerEmailInfo.passwordForEmail,
        },
        debug: true,
      });

      return transporter;
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
  }

  async sendMail({
    templatePath,
    context,
    transporter,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
    transporter?: nodemailer.Transporter;
  }): Promise<void> {
    const template = await fs.readFile(templatePath, 'utf-8');
    const htmlToRender = Handlebars.compile(template, { strict: true })(
      context,
    );

    if (!transporter || Object.keys(transporter).length < 1) {
      transporter = await this.getTransporter();
    }

    await transporter.sendMail({
      ...mailOptions,
      from:
        mailOptions.from ??
        this.configService.getOrThrow('mail.user', { infer: true }),
      html: htmlToRender,
    });
  }
}
