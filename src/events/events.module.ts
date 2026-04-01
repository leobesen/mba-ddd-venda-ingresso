import { EntityManager } from '@mikro-orm/mysql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, OnModuleInit } from '@nestjs/common';
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
import {
  IPartnerRepository,
  PARTNER_REPOSITORY,
} from 'src/@core/events/domain/repositories/partner-repository.interface';
import {
  IUnitOfWork,
  IUNIT_OF_WORK,
} from 'src/@core/common/application/unit-of-work.interface';
import { CustomerService } from 'src/@core/events/application/customer.service';
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository,
} from 'src/@core/events/domain/repositories/customer-repository.interface';
import { EventService } from 'src/@core/events/application/event.service';
import {
  EVENT_REPOSITORY,
  IEventRepository,
} from 'src/@core/events/domain/repositories/event-repository.interface';
import { PaymentGateway } from 'src/@core/events/application/payment.gateway';
import { OrderService } from 'src/@core/events/application/order.service';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/@core/events/domain/repositories/order-repository.interface';
import {
  ISpotReservationRepository,
  SPOT_RESERVATION_REPOSITORY,
} from 'src/@core/events/domain/repositories/spot-reservation-repository.interface';
import { PartnersController } from './partners/partners.controller';
import { CustomersController } from './customers/customers.controller';
import { EventsController } from './events/events.controller';
import { EventSectionsController } from './events/event-sections.controller';
import { EventSpotsController } from './events/event-spots.controller';
import { OrdersController } from './orders/orders.controller';
import { ApplicationModule } from 'src/application/application.module';
import { ApplicationService } from 'src/@core/common/application/application.service';
import { DomainEventManager } from 'src/@core/common/domain/domain-event-manager';
import { PartnerCreated } from 'src/@core/events/domain/domain-events/partner-created.event';

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
    ApplicationModule,
  ],
  providers: [
    {
      provide: PARTNER_REPOSITORY,
      useFactory: (em: EntityManager) => {
        return new PartnerMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: EVENT_REPOSITORY,
      useFactory: (em: EntityManager) => {
        return new EventMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useFactory: (em: EntityManager) => {
        return new CustomerMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: ORDER_REPOSITORY,
      useFactory: (em: EntityManager) => {
        return new OrderMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: SPOT_RESERVATION_REPOSITORY,
      useFactory: (em: EntityManager) => {
        return new SpotReservationMysqlRepository(em);
      },
      inject: [EntityManager],
    },
    {
      provide: PartnerService,
      useFactory: (
        partnerRepository: IPartnerRepository,
        appService: ApplicationService,
      ) => new PartnerService(partnerRepository, appService),
      inject: [PARTNER_REPOSITORY, ApplicationService],
    },
    {
      provide: CustomerService,
      useFactory: (customerRepository: ICustomerRepository, uow: IUnitOfWork) =>
        new CustomerService(customerRepository, uow),
      inject: [CUSTOMER_REPOSITORY, IUNIT_OF_WORK],
    },
    {
      provide: EventService,
      useFactory: (
        eventRepository: IEventRepository,
        partnerRepository: IPartnerRepository,
        uow: IUnitOfWork,
      ) => new EventService(eventRepository, partnerRepository, uow),
      inject: [EVENT_REPOSITORY, PARTNER_REPOSITORY, IUNIT_OF_WORK],
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
        ORDER_REPOSITORY,
        EVENT_REPOSITORY,
        SPOT_RESERVATION_REPOSITORY,
        CUSTOMER_REPOSITORY,
        IUNIT_OF_WORK,
        PaymentGateway,
      ],
    },
  ],
  controllers: [
    PartnersController,
    CustomersController,
    EventsController,
    EventSectionsController,
    EventSpotsController,
    OrdersController,
  ],
})
export class EventsModule implements OnModuleInit {
  constructor(private readonly domainEventManager: DomainEventManager) {}

  onModuleInit() {
    console.log(
      'EventsModule initialized, registering domain event handlers...',
    );
    this.domainEventManager.register(PartnerCreated.name, (event) => {
      console.log('Partner created event received:', event);
    });
  }
}
