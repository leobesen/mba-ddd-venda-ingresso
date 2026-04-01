import { EntityManager } from '@mikro-orm/mysql';
import { EventSpotId } from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/entities/event-spot';
import { SpotReservation } from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/entities/spot-reservation.entity';
import { ISpotReservationRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/events/domain/repositories/spot-reservation-repository.interface';

export class SpotReservationMysqlRepository
  implements ISpotReservationRepository
{
  constructor(private entityManager: EntityManager) {}

  add(entity: SpotReservation): Promise<void> {
    this.entityManager.persist(entity);

    return Promise.resolve();
  }

  findById(spot_id: string | EventSpotId): Promise<SpotReservation | null> {
    return this.entityManager.findOne(SpotReservation, {
      spot_id: typeof spot_id === 'string' ? new EventSpotId(spot_id) : spot_id,
    });
  }

  findAll(): Promise<SpotReservation[]> {
    return this.entityManager.find(SpotReservation, {});
  }

  delete(entity: SpotReservation): Promise<void> {
    this.entityManager.remove(entity);

    return Promise.resolve();
  }
}
