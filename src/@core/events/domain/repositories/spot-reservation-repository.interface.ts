import { IRepository } from 'src/@core/common/domain/repository-interface';
import { SpotReservation } from '../entities/spot-reservation.entity';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISpotReservationRepository
  extends IRepository<SpotReservation> {}
