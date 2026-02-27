import { Entity } from 'src/@core/common/domain/entity';
import Uuid from 'src/@core/common/domain/value-objects/uuid.vo';
import { EventSpot } from './event-spot';

export class EventSectionId extends Uuid {}

export type EventSectionCreateCommand = {
  name: string;
  description: string | null;
  total_spots: number;
  price: number;
};

export type EventSectionConstructorProps = {
  id?: EventSectionId | string;
  name: string;
  description: string | null;
  is_published: boolean;
  total_spots: number;
  total_spots_reserved: number;
  price: number;
  spots?: Set<EventSpot>;
};

export class EventSection extends Entity {
  id: EventSectionId;
  name: string;
  description: string | null;
  is_published: boolean;
  total_spots: number;
  total_spots_reserved: number;
  price: number;
  spots: Set<EventSpot>;

  constructor(props: EventSectionConstructorProps) {
    super();
    this.id =
      props.id instanceof EventSectionId
        ? props.id
        : new EventSectionId(props.id);
    this.name = props.name;
    this.description = props.description;
    this.is_published = props.is_published;
    this.total_spots = props.total_spots;
    this.total_spots_reserved = props.total_spots_reserved;
    this.price = props.price;
    this.spots = props.spots ?? new Set<EventSpot>();
  }

  static create(command: EventSectionCreateCommand) {
    const section = new EventSection({
      ...command,
      description: command.description ?? null,
      is_published: false,
      total_spots_reserved: 0,
    });
    section.InitSpots();
    return section;
  }

  private InitSpots() {
    for (let i = 0; i < this.total_spots; i++) {
      const spot = new EventSpot({
        location: `Spot ${i + 1}`,
        is_published: false,
        is_reserved: false,
      });
      this.spots.add(spot);
    }
  }

  changeName(newName: string) {
    this.name = newName;
  }

  changeDescription(newDescription: string | null) {
    this.description = newDescription;
  }

  changePrice(newPrice: number) {
    this.price = newPrice;
  }

  publishAll() {
    this.publish();
    this.spots.forEach((spot) => spot.publish());
  }

  unpublishAll() {
    this.unpublish();
    this.spots.forEach((spot) => spot.unpublish());
  }

  publish() {
    if (this.spots.size === 0) {
      throw new Error('Cannot publish a section without spots');
    }
    this.is_published = true;
  }

  unpublish() {
    this.is_published = false;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      description: this.description,
      is_published: this.is_published,
      total_spots: this.total_spots,
      total_spots_reserved: this.total_spots_reserved,
      price: this.price,
      spots: Array.from(this.spots).map((spot) => spot.toJSON()),
    };
  }
}

export default EventSection;
