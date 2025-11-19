import { AggregateRoot } from 'src/@core/common/domain/aggregate-root';
import { NameVO } from 'src/@core/common/domain/value-objects/name.vo';

export type CustomerConstructorProps = {
  id: string;
  cpf: string;
  name: NameVO;
};

export class Customer extends AggregateRoot {
  id: string;
  cpf: string;
  name: NameVO;

  constructor(props: CustomerConstructorProps) {
    super();
    this.id = props.id;
    this.cpf = props.cpf;
    this.name = props.name;
  }

  static create(command: { name: NameVO; cpf: string }): Customer {
    const id = crypto.randomUUID();
    return new Customer({
      id,
      cpf: command.cpf,
      name: command.name,
    });
  }

  toJSON() {
    return {
      id: this.id,
      cpf: this.cpf,
      name: this.name,
    };
  }
}
