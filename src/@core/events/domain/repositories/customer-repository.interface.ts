import { IRepository } from 'src/@core/common/domain/repository-interface';
import { Customer } from '../entities/customer.entity';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICustomerRepository extends IRepository<Customer> {}
