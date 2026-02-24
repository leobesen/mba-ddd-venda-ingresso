import crypto from 'crypto';
import { ValueObject } from './value-object';
import { validate as uuidValidate } from 'uuid';

export class Uuid extends ValueObject<string> {
  constructor(id?: string) {
    const value = id || crypto.randomUUID();
    super(value);
    this.validate(value);
  }

  validate(value: string) {
    const isValid = uuidValidate(value);
    if (!isValid) {
      throw new InvalidUuidError(value);
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
