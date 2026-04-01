import { IRepository } from 'src/@core/common/domain/repository-interface';
import { Customer } from '../entities/customer.entity';

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICustomerRepository extends IRepository<Customer> {}
