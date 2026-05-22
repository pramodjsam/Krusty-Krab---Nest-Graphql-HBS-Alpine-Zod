import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
