import { IDomainEventHandler } from 'src/@core/common/application/domain-event-handler.interface';
import { PartnerCreated } from '../../domain/domain-events/partner-created.event';
import { IPartnerRepository } from '../../domain/repositories/partner-repository.interface';
import { DomainEventManager } from 'src/@core/common/domain/domain-event-manager';

export class MyHandlerHandler implements IDomainEventHandler {
  constructor(
    private partnerRepo: IPartnerRepository,
    private domainEventManager: DomainEventManager,
  ) {}

  async handle(event: PartnerCreated): Promise<void> {
    console.log('Handling PartnerCreated event:', event);
    return Promise.resolve();
  }

  static listensTo(): string[] {
    return [PartnerCreated.name];
  }
}
