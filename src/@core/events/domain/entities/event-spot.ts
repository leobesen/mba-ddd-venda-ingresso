import { Entity } from 'src/@core/common/domain/entity';
import Uuid from 'src/@core/common/domain/value-objects/uuid.vo';

export class EventSpotId extends Uuid {}

export type EventSpotConstructorProps = {
  id?: EventSpotId | string;
  location: string | null;
  is_reserved: boolean;
  is_published: boolean;
};

export class EventSpot extends Entity {
  id: EventSpotId;
  location: string | null;
  is_reserved: boolean;
  is_published: boolean;

  constructor(props: EventSpotConstructorProps) {
    super();
    this.id =
      props.id instanceof EventSpotId ? props.id : new EventSpotId(props.id);
    this.location = props.location;
    this.is_reserved = props.is_reserved;
    this.is_published = props.is_published;
  }

  static create() {
    return new EventSpot({
      location: null,
      is_reserved: false,
      is_published: false,
    });
  }

  changeLocation(newLocation: string) {
    this.location = newLocation;
  }

  toJSON() {
    return {
      id: this.id.value,
      location: this.location,
      is_reserved: this.is_reserved,
      is_published: this.is_published,
    };
  }
}
