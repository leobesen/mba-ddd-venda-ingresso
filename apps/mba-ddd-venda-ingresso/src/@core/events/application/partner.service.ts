import { Partner } from '../domain/entities/partner.entity';
import { IPartnerRepository } from '../domain/repositories/partner-repository.interface';
import { ApplicationService } from 'apps/mba-ddd-venda-ingresso/src/@core/common/application/application.service';

export class PartnerService {
  constructor(
    private partnerRepository: IPartnerRepository,
    private applicationService: ApplicationService,
  ) {}

  list() {
    return this.partnerRepository.findAll();
  }

  async create(input: { name: string }) {
    return await this.applicationService.run(async () => {
      const partner = Partner.create(input);
      await this.partnerRepository.add(partner);
      return partner;
    });
  }

  async update(id: string, input: { name?: string }) {
    return await this.applicationService.run(async () => {
      const partner = await this.partnerRepository.findById(id);
      if (!partner) {
        throw new Error('Partner not found');
      }
      if (input.name) {
        partner.changeName(input.name);
      }
      await this.partnerRepository.add(partner);
      return partner;
    });
  }
}
