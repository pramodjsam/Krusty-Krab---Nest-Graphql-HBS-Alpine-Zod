import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import path from 'node:path';
import { engine } from 'express-handlebars';
import { hbsHelpers } from './utils/hbs-helpers.utils';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://127.0.0.1:5672'],
      queue: 'email_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const viewsPath = path.join(process.cwd(), 'views');
  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      layoutsDir: path.join(viewsPath, 'layouts'),
      partialsDir: path.join(viewsPath, 'partials'),
      defaultLayout: 'main',
      helpers: hbsHelpers,
    }),
  );
  app.useStaticAssets(path.join(process.cwd(), 'public'));
  app.setViewEngine('hbs');
  app.setBaseViewsDir(viewsPath);

  app.enableCors();

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  app.use(cookieParser());

  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
