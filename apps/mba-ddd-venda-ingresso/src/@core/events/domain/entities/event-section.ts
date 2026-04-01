import { Entity } from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/entity';
import Uuid from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/value-objects/uuid.vo';
import { EventSpot, EventSpotId } from './event-spot';
import {
  AnyCollection,
  ICollection,
  MyCollectionFactory,
} from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/my-collection';

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
};

export class EventSection extends Entity {
  id: EventSectionId;
  name: string;
  description: string | null;
  is_published: boolean;
  total_spots: number;
  total_spots_reserved: number;
  price: number;
  private _spots: ICollection<EventSpot>;

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
    this._spots = MyCollectionFactory.create<EventSpot>(this, 'spots');
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

  changeLocation(spotId: EventSpotId, newLocation: string) {
    const spot = this.spots.find((s) => s.id.equals(spotId));
    if (!spot) {
      throw new Error('Spot not found');
    }
    spot.changeLocation(newLocation);
  }

  publishAll() {
    this.publish();
    this.spots.forEach((spot) => spot.publish());
  }

  unpublishAll() {
    this.unpublish();
    this.spots.forEach((spot) => spot.unpublish());
  }

  allowReserveSpot(spotId: EventSpotId) {
    if (!this.is_published) {
      return false;
    }
    const spot = this.spots.find((s) => s.id.equals(spotId));
    if (!spot) {
      throw new Error('Spot not found');
    }
    if (!spot.is_published || spot.is_reserved) {
      return false;
    }
    return true;
  }

  markSpotAsReserved(spotId: EventSpotId) {
    const spot = this.spots.find((s) => s.id.equals(spotId));
    if (!spot) {
      throw new Error('Spot not found');
    }
    if (!spot.is_reserved) {
      spot.markSpotAsReserved();
      this.total_spots_reserved += 1;
    } else {
      throw new Error('Spot is already reserved');
    }
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

  get spots(): ICollection<EventSpot> {
    return this._spots;
  }

  set spots(spots: AnyCollection<EventSpot>) {
    this._spots = MyCollectionFactory.createFrom<EventSpot>(spots);
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
