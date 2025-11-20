import crypto from 'crypto';
import { ValueObject } from './value-object';
// import { validate as uuidValidate } from 'uuid';

export class UuidVO extends ValueObject<string> {
  constructor(id?: string) {
    super(id || crypto.randomUUID());
  }

  validate(id: string) {
    if (!id) {
      throw new Error('UUID is required');
    }

    // const isValid = uuidValidate(id);
    // if (!isValid) {
    //   throw new Error('Invalid UUID');
    // }
  }
}
