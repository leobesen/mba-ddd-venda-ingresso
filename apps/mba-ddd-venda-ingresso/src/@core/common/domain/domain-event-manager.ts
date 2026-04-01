import EventEmitter2, { ListenerFn } from 'eventemitter2';
import { AggregateRoot } from './aggregate-root';
import { IDomainEvent } from './domain-event';

type DomainEventHandler = (event: IDomainEvent) => void | Promise<void>;

export class DomainEventManager {
  eventEmitter: EventEmitter2;

  constructor() {
    this.eventEmitter = new EventEmitter2({ wildcard: true });
  }

  register(event: string, handler: DomainEventHandler) {
    this.eventEmitter.on(event, handler as ListenerFn);
  }

  async publish(aggregateRoot: AggregateRoot) {
    for (const event of aggregateRoot.events) {
      await this.eventEmitter.emitAsync(event.constructor.name, event);
    }
    aggregateRoot.clearEvents();
  }
}
