import { AggregateRoot } from 'src/@core/common/domain/aggregate-root';
import { CpfVO } from 'src/@core/common/domain/value-objects/cpf.vo';

export type CustomerConstructorProps = {
  id: string;
  cpf: CpfVO;
  name: string;
};

export class Customer extends AggregateRoot {
  id: string;
  cpf: CpfVO;
  name: string;

  constructor(props: CustomerConstructorProps) {
    super();
    this.id = props.id;
    this.cpf = props.cpf;
    this.name = props.name;
  }

  static create(command: { name: string; cpf: string }): Customer {
    const id = crypto.randomUUID();
    return new Customer({
      id,
      cpf: new CpfVO(command.cpf),
      name: command.name,
    });
  }

  toJSON() {
    return {
      id: this.id,
      cpf: this.cpf.value,
      name: this.name,
    };
  }
}
