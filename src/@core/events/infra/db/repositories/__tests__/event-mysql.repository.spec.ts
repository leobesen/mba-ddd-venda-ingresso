import { MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import {
  EventSchema,
  EventSectionSchema,
  EventSpotSchema,
  PartnerSchema,
} from '../../schemas';
import { EventMysqlRepository } from '../event-mysql.repository';
import { PartnerMysqlRepository } from '../partner-mysql.repository';
import Partner from 'src/@core/events/domain/entities/partner.entity';

test('Event repository should create and find a Event', async () => {
  const orm = await MikroORM.init<MySqlDriver>({
    entities: [EventSchema, EventSectionSchema, EventSpotSchema, PartnerSchema],
    dbName: 'venda_ingresso',
    host: 'localhost',
    port: 3306,
    user: 'user',
    password: 'password',
    forceEntityConstructor: true,
    debug: false,
  });
  await orm.schema.refreshDatabase();
  const em = orm.em.fork();
  const eventRepo = new EventMysqlRepository(em);
  const partnerRepo = new PartnerMysqlRepository(em);

  const partner = Partner.create({ name: 'Partner 1' });
  await partnerRepo.add(partner);
  const event = partner.initEvent({
    name: 'Event 1',
    description: 'Description 1',
    date: new Date(),
  });
  event.addSection({
    name: 'Section 1',
    description: 'Description 1',
    total_spots: 100,
    price: 50,
  });
  await eventRepo.add(event);
  await em.flush();
  em.clear();

  const eventFound = await eventRepo.findById(event.id);
  expect(eventFound).not.toBeNull();
  expect(eventFound?.id.equals(event.id)).toBeTruthy();
  console.log(eventFound);

  await orm.close();
});
