import { AggregateRoot } from 'src/@core/common/domain/aggregate-root';
import { UuidVO } from 'src/@core/common/domain/value-objects/uuid.vo';

export class PartnerId extends UuidVO {}

export type PartnerConstructorProps = {
  id?: PartnerId | string;
  name: string;
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
    return new Partner({
      name: command.name,
    });
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
    };
  }
}
