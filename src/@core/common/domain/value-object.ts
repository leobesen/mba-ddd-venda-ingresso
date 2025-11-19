import isEqual from 'lodash/isEqual';

export abstract class ValueObject<Value = any> {
  protected readonly _value: Value;

  constructor(value: Value) {
    this._value = deepFreeze(value);
  }

  get value(): Value {
    return this._value;
  }

  public equals(obj: this): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }
    if (obj.value === undefined) {
      return false;
    }
    if (obj.constructor.name !== this.constructor.name) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return isEqual(this.value, obj.value);
  }

  toString(): string {
    return JSON.stringify(this._value);
  }
}

function deepFreeze<T>(obj: T) {
  try {
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
      const value = obj[name as keyof T];
      if (value && typeof value === 'object') {
        deepFreeze(value);
      }
    }

    return Object.freeze(obj);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return obj;
  }
}
