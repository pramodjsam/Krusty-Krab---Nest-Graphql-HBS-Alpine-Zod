import { Controller } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailMailer } from './interface/email.interface';
import { EventPattern } from '@nestjs/microservices';
import { EMAIL_SERVICE_PUB } from '../constants';

@Controller()
export class EmailConsumer {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern(EMAIL_SERVICE_PUB)
  sendPasswordResetEmail(email: EmailMailer) {
    return this.emailService.sendEmail(email);
  }
}
