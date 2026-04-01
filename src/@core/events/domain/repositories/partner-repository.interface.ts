import { IRepository } from 'src/@core/common/domain/repository-interface';
import { Partner } from '../entities/partner.entity';

export const PARTNER_REPOSITORY = Symbol('IPartnerRepository');
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPartnerRepository extends IRepository<Partner> {}
