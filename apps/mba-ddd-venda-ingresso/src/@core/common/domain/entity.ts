import { ValueObject } from './value-objects/value-object';

export abstract class Entity {
  readonly id: ValueObject;

  abstract toJSON(): any;

  equals(obj: this): boolean {
    if (obj === null || obj === undefined) return false;

    if (obj.id === undefined || this.id === undefined) return false;

    if (obj.constructor.name !== this.constructor.name) return false;

    return obj.id.equals(this.id);
  }
}
