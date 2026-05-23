import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm/browser';

@EventSubscriber()
export class UserSubscriber
  implements EntitySubscriberInterface<User>, OnModuleInit
{
  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    if (event.entity?.password) {
      event.entity.password = await bcrypt.hash(event.entity.password, 10);
    }
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    if (event.entity?.password) {
      event.entity.password = await bcrypt.hash(
        String(event.entity.password),
        10,
      );
    }
  }
}
