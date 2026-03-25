import { IUnitOfWork } from 'src/@core/common/application/unit-of-work.interface';
import { IEventRepository } from '../domain/repositories/event-repository.interface';
import { IPartnerRepository } from '../domain/repositories/partner-repository.interface';
import { EventSectionId } from '../domain/entities/event-section';
import { EventSpotId } from '../domain/entities/event-spot';

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

  async addSection(input: {
    name: string;
    description: string | null;
    total_spots: number;
    price: number;
    event_id: string;
  }) {
    const event = await this.eventRepository.findById(input.event_id);
    if (!event) {
      throw new Error('Event not found');
    }
    event.addSection({
      name: input.name,
      description: input.description,
      total_spots: input.total_spots,
      price: input.price,
    });
    await this.eventRepository.add(event);
    await this.uow.commit();
    return event;
  }

  async updateSection(input: {
    name?: string;
    description?: string | null;
    event_id: string;
    section_id: string;
  }) {
    const event = await this.eventRepository.findById(input.event_id);
    if (!event) {
      throw new Error('Event not found');
    }
    const sectionId = new EventSectionId(input.section_id);
    event.changeSectionInformation({
      section_id: sectionId,
      name: input.name,
      description: input.description,
    });
    await this.eventRepository.add(event);
    await this.uow.commit();
    return event.sections;
  }

  async findSpots(input: { event_id: string; section_id: string }) {
    const event = await this.eventRepository.findById(input.event_id);
    if (!event) {
      throw new Error('Event not found');
    }
    const sectionId = new EventSectionId(input.section_id);
    const section = event.sections.find((s) => s.id.equals(sectionId));
    if (!section) {
      throw new Error('Section not found');
    }
    return section.spots;
  }

  async updateLocation(input: {
    location: string;
    event_id: string;
    section_id: string;
    spot_id: string;
  }) {
    const event = await this.eventRepository.findById(input.event_id);
    if (!event) {
      throw new Error('Event not found');
    }
    event.changeLocation({
      section_id: new EventSectionId(input.section_id),
      spot_id: new EventSpotId(input.spot_id),
      location: input.location,
    });
    await this.eventRepository.add(event);
    await this.uow.commit();
    const section = event.sections.find((s) =>
      s.id.equals(new EventSectionId(input.section_id)),
    );
    if (!section) {
      throw new Error('Section not found');
    }
    const spot = section.spots.find((s) =>
      s.id.equals(new EventSpotId(input.spot_id)),
    );
    if (!spot) {
      throw new Error('Spot not found');
    }
    return spot;
  }

  async publishAll(input: { event_id: string }) {
    const event = await this.eventRepository.findById(input.event_id);
    if (!event) {
      throw new Error('Event not found');
    }
    event.publishAll();
    await this.eventRepository.add(event);
    await this.uow.commit();
    return event;
  }
}
