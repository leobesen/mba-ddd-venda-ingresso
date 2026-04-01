import { MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import { CustomerSchema } from '../../schemas';
import { Customer } from '../../../../domain/entities/customer.entity';
import { CustomerMysqlRepository } from '../customer-mysql.repository';

test('Customer repository should create and find a Customer', async () => {
  const orm = await MikroORM.init<MySqlDriver>({
    entities: [CustomerSchema],
    dbName: 'venda_ingresso',
    host: 'localhost',
    port: 3306,
    user: 'user',
    password: 'password',
    forceEntityConstructor: true,
  });
  await orm.schema.refreshDatabase();
  const em = orm.em.fork();
  const customerRepo = new CustomerMysqlRepository(em);

  const customer = Customer.create({ name: 'Customer 1', cpf: '70375887091' });
  await customerRepo.add(customer);
  await em.flush();
  em.clear();
  let customerFound = await customerRepo.findById(customer.id);
  if (!customerFound) {
    throw new Error('Customer not found');
  }
  expect(customerFound.id.equals(customer.id)).toBeTruthy();
  // expect(customerFound.name).toBe(customer.name);
  // expect(customerFound.cpf.value).toBe('70375887091');
  customer.changeName('Customer 2');
  await customerRepo.add(customer);
  await em.flush();
  em.clear();

  customerFound = await customerRepo.findById(customer.id);
  if (!customerFound) {
    throw new Error('Customer not found after update');
  }
  expect(customerFound.id.equals(customer.id)).toBeTruthy();
  expect(customerFound.name).toBe(customer.name);
  expect(customerFound.cpf.toString()).toBe(customer.cpf.toString());
  await customerRepo.delete(customer);
  await em.flush();
  em.clear();

  customerFound = await customerRepo.findById(customer.id);
  expect(customerFound).toBeNull();

  await orm.close();
});
