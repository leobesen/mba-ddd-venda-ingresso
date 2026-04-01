import { EntityManager } from '@mikro-orm/mysql';
import { Event, EventId } from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/entities/event.entity';
import { IEventRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/repositories/event-repository.interface';

export class EventMysqlRepository implements IEventRepository {
  constructor(private entityManager: EntityManager) {}

  add(entity: Event): Promise<void> {
    this.entityManager.persist(entity);

    return Promise.resolve();
  }

  findById(id: string | EventId): Promise<Event | null> {
    return this.entityManager.findOne(Event, {
      id: typeof id === 'string' ? new EventId(id) : id,
    });
  }

  findAll(): Promise<Event[]> {
    return this.entityManager.find(Event, {});
  }

  delete(entity: Event): Promise<void> {
    this.entityManager.remove(entity);

    return Promise.resolve();
  }
}
