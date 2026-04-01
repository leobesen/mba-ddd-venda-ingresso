import { AggregateRoot } from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/aggregate-root';
import { Uuid } from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/value-objects/uuid.vo';
import { Event } from './event.entity';
import { PartnerCreated } from '../domain-events/partner-created.event';
import { PartnerChangedName } from '../domain-events/partner-changed-name.event';

export class PartnerId extends Uuid {}

export type PartnerConstructorProps = {
  id?: PartnerId | string;
  name: string;
};

export type InitEventCommand = {
  name: string;
  description: string | null;
  date: Date;
};

export class Partner extends AggregateRoot {
  id: PartnerId;
  name: string;

  constructor(props: PartnerConstructorProps) {
    super();
    this.id =
      props.id instanceof PartnerId ? props.id : new PartnerId(props.id);
    this.name = props.name;
  }

  static create(command: { name: string }) {
    const partner = new Partner({
      name: command.name,
    });
    partner.addEvent(new PartnerCreated(partner.id, partner.name));
    return partner;
  }

  initEvent(command: InitEventCommand) {
    return Event.create({ ...command, partner_id: this.id });
  }

  changeName(newName: string) {
    this.name = newName;
    this.addEvent(new PartnerChangedName(this.id, newName));
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
    };
  }
}

export default Partner;
