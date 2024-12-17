import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/all-config.type';
import * as fs from 'fs/promises';
import Handlebars from 'handlebars';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService<AllConfigType>) {
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

  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    const template = await fs.readFile(templatePath, 'utf-8');
    const htmlToRender = Handlebars.compile(template, { strict: true })(
      context,
    );

    await this.transporter.sendMail({
      ...mailOptions,
      from:
        mailOptions.from ??
        this.configService.getOrThrow('mail.user', { infer: true }),
      html: htmlToRender,
    });
  }
}
