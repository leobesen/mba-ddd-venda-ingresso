import { EntityManager } from '@mikro-orm/mysql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CustomerMysqlRepository } from 'src/@core/events/infra/db/repositories/customer-mysql.repository';
import { OrderMysqlRepository } from 'src/@core/events/infra/db/repositories/order-mysql.repository';
import { EventMysqlRepository } from 'src/@core/events/infra/db/repositories/event-mysql.repository';
import { PartnerMysqlRepository } from 'src/@core/events/infra/db/repositories/partner-mysql.repository';
import {
  CustomerSchema,
  EventSchema,
  EventSectionSchema,
  EventSpotSchema,
  OrderSchema,
  PartnerSchema,
  SpotReservationSchema,
} from 'src/@core/events/infra/db/schemas';
import { SpotReservationMysqlRepository } from 'src/@core/events/infra/db/repositories/spot-reservation-mysql.repository';
import { PartnerService } from 'src/@core/events/application/partner.service';
import { IPartnerRepository } from 'src/@core/events/domain/repositories/partner-repository.interface';
import { IUnitOfWork } from 'src/@core/common/application/unit-of-work.interface';
import { CustomerService } from 'src/@core/events/application/customer.service';
import { ICustomerRepository } from 'src/@core/events/domain/repositories/customer-repository.interface';
import { EventService } from 'src/@core/events/application/event.service';
import { IEventRepository } from 'src/@core/events/domain/repositories/event-repository.interface';
import { PaymentGateway } from 'src/@core/events/application/payment.gateway';
import { OrderService } from 'src/@core/events/application/order.service';
import { IOrderRepository } from 'src/@core/events/domain/repositories/order-repository.interface';
import { ISpotReservationRepository } from 'src/@core/events/domain/repositories/spot-reservation-repository.interface';
import { PartnersController } from './partners/partners.controller';
import { CustomersController } from './customers/customers.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      CustomerSchema,
      PartnerSchema,
      EventSchema,
      EventSectionSchema,
      EventSpotSchema,
      OrderSchema,
      SpotReservationSchema,
    ]),
  ],
  providers: [
    {
      provide: 'IPartnerRepository',
      useFactory: (em: EntityManager) => {
        return new PartnerMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: 'IEventRepository',
      useFactory: (em: EntityManager) => {
        return new EventMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: 'ICustomerRepository',
      useFactory: (em: EntityManager) => {
        return new CustomerMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: 'IOrderRepository',
      useFactory: (em: EntityManager) => {
        return new OrderMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: 'ISpotReservationRepository',
      useFactory: (em: EntityManager) => {
        return new SpotReservationMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: PartnerService,
      useFactory: (partnerRepository: IPartnerRepository, uow: IUnitOfWork) =>
        new PartnerService(partnerRepository, uow),
      inject: ['IPartnerRepository', 'IUnitOfWork'],
    },
    {
      provide: CustomerService,
      useFactory: (customerRepository: ICustomerRepository, uow: IUnitOfWork) =>
        new CustomerService(customerRepository, uow),
      inject: ['ICustomerRepository', 'IUnitOfWork'],
    },
    {
      provide: EventService,
      useFactory: (
        eventRepository: IEventRepository,
        partnerRepository: IPartnerRepository,
        uow: IUnitOfWork,
      ) => new EventService(eventRepository, partnerRepository, uow),
      inject: ['IEventRepository', 'IPartnerRepository', 'IUnitOfWork'],
    },
    PaymentGateway,
    {
      provide: OrderService,
      useFactory: (
        orderRepository: IOrderRepository,
        customerRepository: ICustomerRepository,
        eventRepository: IEventRepository,
        spotReservationRepository: ISpotReservationRepository,
        uow: IUnitOfWork,
        paymentGateway: PaymentGateway,
      ) =>
        new OrderService(
          orderRepository,
          customerRepository,
          eventRepository,
          spotReservationRepository,
          paymentGateway,
          uow,
        ),
      inject: [
        'IOrderRepository',
        'IEventRepository',
        'ISpotReservationRepository',
        'ICustomerRepository',
        'IUnitOfWork',
        PaymentGateway,
      ],
    },
  ],
  controllers: [PartnersController, CustomersController],
})
export class EventsModule {}
