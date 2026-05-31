import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'src/config';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { GraphQLUpload } from 'graphql-upload';
import { UserSubscriber } from 'src/modules/user/user.subscriber';
import { EmailModule } from './email/email.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import KeyvRedis from '@keyv/redis';
import { RedisCacheService } from './redis-cache/redis-cache.service';

@Global()
@Module({
  providers: [CloudinaryProvider, CloudinaryService, RedisCacheService],
  exports: [CloudinaryService, RedisCacheService],
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [
          new KeyvRedis('redis://127.0.0.1:6379'), //TODO: move to env variables
        ],
        ttl: 600000,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expireDay'),
        },
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      graphiql: true,
      playground: false,
      resolvers: { Upload: GraphQLUpload },
      context: ({ req }) => ({ req }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        synchronize: true,
        autoLoadEntities: true,
        subscribers: [UserSubscriber],
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    RabbitmqModule,
    RedisCacheModule,
  ],
})
export class CoreModule {}
