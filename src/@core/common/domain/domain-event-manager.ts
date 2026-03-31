import EventEmitter2, { ListenerFn } from 'eventemitter2';
import { AggregateRoot } from './aggregate-root';

export class DomainEventManager {
  eventEmitter: EventEmitter2;

  constructor() {
    this.eventEmitter = new EventEmitter2({ wildcard: true });
  }

  register(event: string, handler: ListenerFn) {
    this.eventEmitter.on(event, handler);
  }

  async publish(aggregateRoot: AggregateRoot) {
    for (const event of aggregateRoot.events) {
      await this.eventEmitter.emitAsync(event.constructor.name, event);
    }
  }
}
