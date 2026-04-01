import { EntityManager } from '@mikro-orm/mysql';
import { Order, OrderId } from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/entities/order.entity';
import { IOrderRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/repositories/order-repository.interface';

export class OrderMysqlRepository implements IOrderRepository {
  constructor(private entityManager: EntityManager) {}

  add(entity: Order): Promise<void> {
    this.entityManager.persist(entity);

    return Promise.resolve();
  }

  findById(id: string | OrderId): Promise<Order | null> {
    return this.entityManager.findOne(Order, {
      id: typeof id === 'string' ? new OrderId(id) : id,
    });
  }

  findAll(): Promise<Order[]> {
    return this.entityManager.find(Order, {});
  }

  delete(entity: Order): Promise<void> {
    this.entityManager.remove(entity);

    return Promise.resolve();
  }
}
