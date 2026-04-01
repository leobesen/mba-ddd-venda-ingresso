import { IRepository } from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/repository-interface';
import { Partner } from '../entities/partner.entity';

export const PARTNER_REPOSITORY = Symbol('IPartnerRepository');
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPartnerRepository extends IRepository<Partner> {}
