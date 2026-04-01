import { EntityManager } from '@mikro-orm/mysql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, OnModuleInit } from '@nestjs/common';
import { CustomerMysqlRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/events/infra/db/repositories/customer-mysql.repository';
import { OrderMysqlRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/events/infra/db/repositories/order-mysql.repository';
import { EventMysqlRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/events/infra/db/repositories/event-mysql.repository';
import { PartnerMysqlRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/events/infra/db/repositories/partner-mysql.repository';
import {
  CustomerSchema,
  EventSchema,
  EventSectionSchema,
  EventSpotSchema,
  OrderSchema,
  PartnerSchema,
  SpotReservationSchema,
} from 'apps/mba-ddd-venda-ingresso/src/@core/events/infra/db/schemas';
import { SpotReservationMysqlRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/events/infra/db/repositories/spot-reservation-mysql.repository';
import { PartnerService } from 'apps/mba-ddd-venda-ingresso/src/@core/events/application/partner.service';
import {
  IPartnerRepository,
  PARTNER_REPOSITORY,
} from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/repositories/partner-repository.interface';
import {
  IUnitOfWork,
  IUNIT_OF_WORK,
} from 'apps/mba-ddd-venda-ingresso/src/@core/common/application/unit-of-work.interface';
import { CustomerService } from 'apps/mba-ddd-venda-ingresso/src/@core/events/application/customer.service';
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository,
} from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/repositories/customer-repository.interface';
import { EventService } from 'apps/mba-ddd-venda-ingresso/src/@core/events/application/event.service';
import {
  EVENT_REPOSITORY,
  IEventRepository,
} from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/repositories/event-repository.interface';
import { PaymentGateway } from 'apps/mba-ddd-venda-ingresso/src/@core/events/application/payment.gateway';
import { OrderService } from 'apps/mba-ddd-venda-ingresso/src/@core/events/application/order.service';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/repositories/order-repository.interface';
import {
  ISpotReservationRepository,
  SPOT_RESERVATION_REPOSITORY,
} from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/repositories/spot-reservation-repository.interface';
import { PartnersController } from './partners/partners.controller';
import { CustomersController } from './customers/customers.controller';
import { EventsController } from './events/events.controller';
import { EventSectionsController } from './events/event-sections.controller';
import { EventSpotsController } from './events/event-spots.controller';
import { OrdersController } from './orders/orders.controller';
import { ApplicationModule } from 'apps/mba-ddd-venda-ingresso/src/application/application.module';
import { ApplicationService } from 'apps/mba-ddd-venda-ingresso/src/@core/common/application/application.service';
import { DomainEventManager } from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/domain-event-manager';
import { PartnerCreated } from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/domain-events/partner-created.event';
import { MyHandlerHandler } from 'apps/mba-ddd-venda-ingresso/src/@core/events/application/handlers/my-handler.handler';
import { ModuleRef } from '@nestjs/core';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { IIntegrationEvent } from '../@core/common/domain/integration-event';
import { Queue } from 'bull';
import { PartnerCreatedIntegrationEvent } from '../@core/events/domain/integration-events/partner-created.int-events';

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
    BullModule.registerQueue({ name: 'integration-events' }),
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
    {
      provide: MyHandlerHandler,
      useFactory: (
        partnerRepo: IPartnerRepository,
        domainEventManager: DomainEventManager,
      ) => new MyHandlerHandler(partnerRepo, domainEventManager),
      inject: [PARTNER_REPOSITORY, DomainEventManager],
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
  constructor(
    private readonly domainEventManager: DomainEventManager,
    private moduleRef: ModuleRef,
    @InjectQueue('integration-events')
    private integrationEventQueue: Queue<IIntegrationEvent>,
  ) {}

  onModuleInit() {
    console.log(
      'EventsModule initialized, registering domain event handlers...',
    );
    MyHandlerHandler.listensTo().forEach((eventName) => {
      this.domainEventManager.register(eventName, async (event) => {
        const handler: MyHandlerHandler =
          await this.moduleRef.resolve(MyHandlerHandler);
        await handler.handle(event as PartnerCreated);
      });
    });
    this.domainEventManager.register(PartnerCreated.name, async (event) => {
      const integrationEvent = new PartnerCreatedIntegrationEvent(
        event as PartnerCreated,
      );
      await this.integrationEventQueue.add(integrationEvent);
    });
  }
}
