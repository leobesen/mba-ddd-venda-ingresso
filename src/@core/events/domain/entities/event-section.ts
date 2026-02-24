import { Entity } from 'src/@core/common/domain/entity';
import Uuid from 'src/@core/common/domain/value-objects/uuid.vo';

export class EventSectionId extends Uuid {}

export type EventSectionCreateCommand = {
  name: string;
  decription: string | null;
  total_spots: number;
  price: number;
};

export type EventSectionConstructorProps = {
  id?: EventSectionId | string;
  name: string;
  decription: string | null;
  is_published: boolean;
  total_spots: number;
  total_spots_reserved: number;
  price: number;
};

export class EventSection extends Entity {
  id: EventSectionId;
  name: string;
  decription: string | null;
  is_published: boolean;
  total_spots: number;
  total_spots_reserved: number;
  price: number;

  constructor(props: EventSectionConstructorProps) {
    super();
    this.id =
      props.id instanceof EventSectionId
        ? props.id
        : new EventSectionId(props.id);
    this.name = props.name;
    this.decription = props.decription;
    this.is_published = props.is_published;
    this.total_spots = props.total_spots;
    this.total_spots_reserved = props.total_spots_reserved;
    this.price = props.price;
  }

  static create(command: EventSectionCreateCommand) {
    return new EventSection({
      ...command,
      decription: command.decription ?? null,
      is_published: false,
      total_spots_reserved: 0,
    });
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      decription: this.decription,
      is_published: this.is_published,
      total_spots: this.total_spots,
      total_spots_reserved: this.total_spots_reserved,
      price: this.price,
    };
  }
}

export default EventSection;
