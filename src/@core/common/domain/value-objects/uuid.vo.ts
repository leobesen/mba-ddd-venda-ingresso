import crypto from 'crypto';
import { ValueObject } from './value-object';
import { validate as uuidValidate } from 'uuid';

export class Uuid extends ValueObject<string> {
  constructor(id?: string) {
    super(id || crypto.randomUUID());
    this.validate();
  }

  validate() {
    const isValid = uuidValidate(this._value);
    if (!isValid) {
      throw new InvalidUuidError(this._value);
    }
  }
}

export class InvalidUuidError extends Error {
  constructor(value: string) {
    super(`Invalid UUID: ${value}`);
    this.name = 'InvalidUuidError';
  }
}

export default Uuid;
