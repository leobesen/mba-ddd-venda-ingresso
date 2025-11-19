import isEqual from 'lodash/isEqual';

export abstract class ValueObject<Value = any> {
  protected readonly _value: Value;

  constructor(value: Value) {
    this.validate(value);
    this._value = deepFreeze(value);
  }

  protected validate(value: Value): void {
    // Optional: Override in subclasses to validate invariants
  }

  get value(): Value {
    return this._value;
  }

  public equals(obj: this): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }

    // Safer than constructor.name for minification
    if (!(obj instanceof ValueObject)) {
      return false;
    }

    // strict check for exact same class if desired
    if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(obj)) {
      return false;
    }

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
