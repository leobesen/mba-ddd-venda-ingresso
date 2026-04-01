import { IRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/repository-interface';
import { Event } from '../entities/event.entity';

export const EVENT_REPOSITORY = Symbol('IEventRepository');
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IEventRepository extends IRepository<Event> {}
