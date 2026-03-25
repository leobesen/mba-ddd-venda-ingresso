import { IUnitOfWork } from 'src/@core/common/application/unit-of-work.interface';
import { IEventRepository } from '../domain/repositories/event-repository.interface';
import { IPartnerRepository } from '../domain/repositories/partner-repository.interface';

export class EventService {
  constructor(
    private eventRepository: IEventRepository,
    private partnerRepository: IPartnerRepository,
    private uow: IUnitOfWork,
  ) {}

  list() {
    return this.eventRepository.findAll();
  }

  async findSections(eventId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    return event.sections;
  }

  async create(input: {
    name: string;
    description: string | null;
    date: Date;
    partner_id: string;
  }) {
    const partner = await this.partnerRepository.findById(input.partner_id);
    if (!partner) {
      throw new Error('Partner not found');
    }
    const event = partner.initEvent({
      name: input.name,
      date: input.date,
      description: input.description,
    });

    await this.eventRepository.add(event);
    await this.uow.commit();
    return event;
  }

  async update(id: string, input: { name?: string }) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }
    if (input.name) {
      event.changeName(input.name);
    }
    await this.eventRepository.add(event);
    await this.uow.commit();
    return event;
  }
}
