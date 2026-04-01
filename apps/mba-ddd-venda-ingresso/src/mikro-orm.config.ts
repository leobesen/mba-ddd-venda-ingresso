import 'tsconfig-paths/register';
import { defineConfig } from '@mikro-orm/mysql';

import {
  CustomerSchema,
  EventSchema,
  EventSectionSchema,
  EventSpotSchema,
  OrderSchema,
  PartnerSchema,
  SpotReservationSchema,
} from './@core/events/infra/db/schemas';

export default defineConfig({
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
});
