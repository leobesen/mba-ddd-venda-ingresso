import { NestFactory } from '@nestjs/core';
import { EmailModule } from './email.module';

async function bootstrap() {
  const app = await NestFactory.create(EmailModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
