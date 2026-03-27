import { IRepository } from 'src/@core/common/domain/repository-interface';
import { Order } from '../entities/order.entity';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IOrderRepository extends IRepository<Order> {}
