import { AggregateRoot } from 'src/@core/common/domain/aggregate-root';
import { Cpf } from 'src/@core/common/domain/value-objects/cpf.vo';
import { Uuid } from 'src/@core/common/domain/value-objects/uuid.vo';

export class CustomerId extends Uuid {}

export type CustomerConstructorProps = {
  id?: CustomerId | string;
  cpf: string;
  name: string;
};

export class Customer extends AggregateRoot {
  id: CustomerId;
  cpf: Cpf;
  name: string;

  constructor(props: CustomerConstructorProps) {
    super();
    this.id =
      props.id instanceof CustomerId ? props.id : new CustomerId(props.id);
    this.cpf = new Cpf(props.cpf);
    this.name = props.name;
  }

  static create(command: { name: string; cpf: string }): Customer {
    return new Customer({
      cpf: command.cpf,
      name: command.name,
    });
  }

  toJSON() {
    return {
      id: this.id.value,
      cpf: this.cpf.value,
      name: this.name,
    };
  }
}
