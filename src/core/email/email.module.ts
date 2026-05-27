import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailConsumer } from './email.consumer';

@Module({
  controllers: [EmailConsumer],
  providers: [EmailService],
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('email.host'),
          port: configService.get<number>('email.port'),
          secure: false,
          auth: {
            user: configService.get<string>('email.authUser'),
            pass: configService.get<string>('email.authPass'),
          },
        },
        defaults: {
          from: "'nest-modules' <modules@nestjs.com>",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [EmailService],
})
export class EmailModule {}
