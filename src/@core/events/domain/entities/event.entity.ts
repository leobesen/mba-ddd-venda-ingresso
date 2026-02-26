import { AggregateRoot } from 'src/@core/common/domain/aggregate-root';
import { Uuid } from 'src/@core/common/domain/value-objects/uuid.vo';
import { PartnerId } from './partner.entity';
import { EventSection } from './event-section';

export class EventId extends Uuid {}

export type CreateEventCommand = {
  name: string;
  description: string | null;
  date: Date;
  partner_id: PartnerId;
};

export type AddSectionCommand = {
  name: string;
  description: string | null;
  total_spots: number;
  price: number;
};

export type EventConstructorProps = {
  id?: EventId | string;
  name: string;
  description: string | null;
  date: Date;
  is_published: boolean;

  total_spots: number;
  total_spotts_reserved: number;
  partner_id: PartnerId;
  sections?: Set<EventSection>;
};

export class Event extends AggregateRoot {
  id: EventId;
  name: string;
  description: string | null;
  date: Date;
  is_published: boolean;

  total_spots: number;
  total_spotts_reserved: number;
  partner_id: PartnerId;
  sections: Set<EventSection>;

  constructor(props: EventConstructorProps) {
    super();
    this.id = props.id instanceof EventId ? props.id : new EventId(props.id);
    this.name = props.name;
    this.description = props.description;
    this.date = props.date;
    this.is_published = props.is_published;
    this.total_spots = props.total_spots;
    this.total_spotts_reserved = props.total_spotts_reserved;
    this.partner_id =
      props.partner_id instanceof PartnerId
        ? props.partner_id
        : new PartnerId(props.partner_id);
    this.sections = props.sections ?? new Set<EventSection>();
  }

  static create(command: CreateEventCommand) {
    return new Event({
      ...command,
      description: command.description ?? null,
      is_published: false,
      total_spots: 0,
      total_spotts_reserved: 0,
    });
  }

  addSection(command: AddSectionCommand) {
    const section = EventSection.create(command);
    this.sections.add(section);
    this.total_spots += section.total_spots;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      description: this.description,
      date: this.date,
      is_published: this.is_published,
      total_spots: this.total_spots,
      total_spotts_reserved: this.total_spotts_reserved,
      partner_id: this.partner_id.value,
      sections: Array.from(this.sections).map((section) => section.toJSON()),
    };
  }
}

export default Event;
