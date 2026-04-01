import { DomainEventManager } from '../domain/domain-event-manager';
import { IUnitOfWork } from './unit-of-work.interface';

export class ApplicationService {
  constructor(
    private uow: IUnitOfWork,
    private domainEventManager: DomainEventManager,
  ) {}

  start() {}

  async finish() {
    const aggregateRoots = this.uow.getAggregateRoots();
    for (const aggregateRoot of aggregateRoots) {
      await this.domainEventManager.publish(aggregateRoot);
    }
    await this.uow.commit();
    for (const aggregateRoot of aggregateRoots) {
      await this.domainEventManager.publishForIntegrationEvent(aggregateRoot);
    }
  }

  fail() {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    this.start();
    try {
      const result = await fn();
      await this.finish();
      return result;
    } catch (error) {
      this.fail();
      throw error;
    }
  }
}
