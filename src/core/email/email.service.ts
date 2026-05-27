import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailMailer } from './interface/email.interface';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  sendEmail(data: EmailMailer) {
    return this.mailerService.sendMail(data);
  }
}
