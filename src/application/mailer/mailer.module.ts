import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { OwnerModule } from '@resources/owner/owner.module';

@Module({
  imports: [OwnerModule],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
