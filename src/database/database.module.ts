import { EntityManager, MySqlDriver } from '@mikro-orm/mysql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { IUNIT_OF_WORK } from 'src/@core/common/application/unit-of-work.interface';
import { UnitOfWorkMikroOrm } from 'src/@core/common/infra/unit-of-work-mikro-orm';
import {
  CustomerSchema,
  EventSchema,
  EventSectionSchema,
  EventSpotSchema,
  OrderSchema,
  PartnerSchema,
  SpotReservationSchema,
} from 'src/@core/events/infra/db/schemas';

@Global()
@Module({
  imports: [
    MikroOrmModule.forRoot({
      driver: MySqlDriver,
      entities: [
        CustomerSchema,
        PartnerSchema,
        EventSchema,
        EventSectionSchema,
        EventSpotSchema,
        OrderSchema,
        SpotReservationSchema,
      ],
      dbName: 'venda_ingresso',
      host: 'localhost',
      port: 3306,
      user: 'user',
      password: 'password',
      forceEntityConstructor: true,
    }),
  ],
  providers: [
    {
      provide: IUNIT_OF_WORK,
      useFactory: (em: EntityManager) => {
        return new UnitOfWorkMikroOrm(em);
      },
      inject: [EntityManager],
    },
  ],
  exports: [IUNIT_OF_WORK],
})
export class DatabaseModule {}
