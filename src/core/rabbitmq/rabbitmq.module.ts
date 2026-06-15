import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EMAIL_SERVICE_MQ } from '../constants';

// TODO: IMPROVEMENTS
//  MOVE RABBITMQ MODULE TO CORE MODULE
@Module({
  providers: [],
  imports: [
    ClientsModule.register([
      {
        name: EMAIL_SERVICE_MQ,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://127.0.0.1:5672'],
          queue: 'email_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitmqModule {}
