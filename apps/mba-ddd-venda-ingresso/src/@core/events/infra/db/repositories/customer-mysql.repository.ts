import { EntityManager } from '@mikro-orm/mysql';
import {
  Customer,
  CustomerId,
} from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/entities/customer.entity';
import { ICustomerRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/repositories/customer-repository.interface';

export class CustomerMysqlRepository implements ICustomerRepository {
  constructor(private entityManager: EntityManager) {}

  add(entity: Customer): Promise<void> {
    this.entityManager.persist(entity);

    return Promise.resolve();
  }

  findById(id: string | CustomerId): Promise<Customer | null> {
    return this.entityManager.findOne(Customer, {
      id: typeof id === 'string' ? new CustomerId(id) : id,
    });
  }

  findAll(): Promise<Customer[]> {
    return this.entityManager.find(Customer, {});
  }

  delete(entity: Customer): Promise<void> {
    this.entityManager.remove(entity);

    return Promise.resolve();
  }
}
