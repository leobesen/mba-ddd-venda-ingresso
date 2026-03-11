import { MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import { PartnerSchema } from '../schemas';
import Partner from '../../../domain/entities/partner.entity';
import { PartnerMysqlRepository } from './partner-mysql.repository';

test('Partner repository should create and find a partner', async () => {
  const orm = await MikroORM.init<MySqlDriver>({
    entities: [PartnerSchema],
    dbName: 'venda_ingresso',
    host: 'localhost',
    port: 3306,
    user: 'user',
    password: 'password',
    forceEntityConstructor: true,
  });
  await orm.schema.refreshDatabase();
  const em = orm.em.fork();
  const partnerRepo = new PartnerMysqlRepository(em);

  const partner = Partner.create({ name: 'Partner 1' });
  await partnerRepo.add(partner);
  await em.flush();
  em.clear();

  let partnerFound = await partnerRepo.findById(partner.id);
  if (!partnerFound) {
    throw new Error('Partner not found');
  }
  expect(partnerFound.id.equals(partner.id)).toBeTruthy();
  expect(partnerFound.name).toBe(partner.name);

  partner.changeName('Partner 2');
  await partnerRepo.add(partner);
  await em.flush();
  em.clear();

  partnerFound = await partnerRepo.findById(partner.id);
  if (!partnerFound) {
    throw new Error('Partner not found after update');
  }
  expect(partnerFound.id.equals(partner.id)).toBeTruthy();
  expect(partnerFound.name).toBe(partner.name);

  await partnerRepo.delete(partner);
  await em.flush();
  em.clear();

  partnerFound = await partnerRepo.findById(partner.id);
  expect(partnerFound).toBeNull();

  await orm.close();
});
