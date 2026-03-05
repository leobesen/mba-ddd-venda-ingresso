import { MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import { PartnerSchema } from './schemas';
import Partner from '../../domain/entities/partner.entity';

test('Should create a partner schema', async () => {
  const orm = await MikroORM.init<MySqlDriver>({
    entities: [PartnerSchema],
    dbName: 'venda_ingresso',
    host: 'localhost',
    port: 3306,
    user: 'user',
    password: 'password',
  });
  await orm.schema.refreshDatabase();
  const em = orm.em.fork();
  const partner = Partner.create({ name: 'Partner 1' });
  console.log(partner);
  em.persist(partner);
  await em.flush();
  // Force a clean unit of work to ensure the entity is saved and can be found
  em.clear();
  const partnerFound = await em.findOne(Partner, { id: partner.id });
  console.log(partnerFound);

  await orm.close();
});
