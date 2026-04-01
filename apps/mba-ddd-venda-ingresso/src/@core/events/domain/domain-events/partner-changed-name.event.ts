import { IDomainEvent } from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/domain-event';
import { PartnerId } from '../entities/partner.entity';

export class PartnerChangedName implements IDomainEvent {
  readonly event_version: number = 1;
  readonly occurred_on: Date;
  readonly aggregate_id: PartnerId;

  constructor(
    readonly partner_id: PartnerId,
    readonly name: string,
  ) {
    this.occurred_on = new Date();
    this.aggregate_id = partner_id;
  }
}
