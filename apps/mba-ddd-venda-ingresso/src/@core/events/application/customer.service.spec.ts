import { MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import { CustomerSchema } from '../infra/db/schemas';
import { CustomerMysqlRepository } from '../infra/db/repositories/customer-mysql.repository';
import { Customer } from '../domain/entities/customer.entity';
import { CustomerService } from './customer.service';
import { UnitOfWorkMikroOrm } from 'apps/mba-ddd-venda-ingresso/src/@core/common/infra/unit-of-work-mikro-orm';

test('Should list customers', async () => {
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
  const unitOfWork = new UnitOfWorkMikroOrm(em);
  const customerService = new CustomerService(customerRepo, unitOfWork);
  const customer = Customer.create({ name: 'Customer 1', cpf: '50290805031' });
  await customerRepo.add(customer);
  await em.flush();
  em.clear();

  const customers = await customerService.list();
  expect(customers).toHaveLength(1);

  await orm.close();
});

test('Should register a customer', async () => {
  const orm = await MikroORM.init<MySqlDriver>({
    entities: [CustomerSchema],
    dbName: 'venda_ingresso',
    host: 'localhost',
    port: 3306,
    user: 'user',
    password: 'password',
    // forceEntityConstructor: true,
  });
  await orm.schema.refreshDatabase();
  const em = orm.em.fork();
  const customerRepo = new CustomerMysqlRepository(em);
  const unitOfWork = new UnitOfWorkMikroOrm(em);
  const customerService = new CustomerService(customerRepo, unitOfWork);

  const input = { name: 'Customer 1', cpf: '50290805031' };
  const customer = await customerService.register(input);
  expect(customer).toBeInstanceOf(Customer);
  expect(customer.name).toBe(input.name);
  expect(customer.cpf.value).toBe(input.cpf);

  em.clear();

  const customerFound = await customerRepo.findById(customer.id);
  expect(customerFound).not.toBeNull();
  expect(customerFound?.name).toBe(input.name);
  expect(customerFound?.cpf.value).toBe(input.cpf);

  await orm.close();
});
