import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConsumerService } from './consumer.service';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: 'amqp://admin:admin@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, ConsumerService],
})
export class EmailModule {}
