import { IRepository } from 'src/@core/common/domain/repository-interface';
import { Event } from '../entities/event.entity';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IEventRepository extends IRepository<Event> {}
