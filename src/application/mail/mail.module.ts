import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import mailConfig from './config/mail.config';
import { MailerModule } from '@application/mailer/mailer.module';

@Module({
  imports: [ConfigModule.forFeature(mailConfig), MailerModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
