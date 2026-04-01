import { Collection } from '@mikro-orm/core';

export interface ICollection<T extends object> {
  getItems(): T[];
  add(item: T, ...items: T[]): void;
  remove(item: T, ...items: T[]): void;
  find(predicate: (item: T) => boolean): T | undefined;
  forEach(callbackfn: (value: T, index: number) => void): void;
  map<U>(callbackfn: (value: T, index: number) => U): U[];
  removeAll(): void;
  count(): number;
  size: number;
  values(): IterableIterator<T>;
  [Symbol.iterator](): IterableIterator<T>;
}
//Design Pattern - Proxy

export type AnyCollection<T extends object> = Collection<T>;

class InMemoryCollection<T extends object> implements ICollection<T> {
  private readonly items = new Set<T>();

  getItems(): T[] {
    return Array.from(this.items);
  }

  add(item: T, ...items: T[]): void {
    [item, ...items].forEach((entry) => this.items.add(entry));
  }

  remove(item: T, ...items: T[]): void {
    [item, ...items].forEach((entry) => this.items.delete(entry));
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.getItems().find(predicate);
  }

  forEach(callbackfn: (value: T, index: number) => void): void {
    this.getItems().forEach(callbackfn);
  }

  map<U>(callbackfn: (value: T, index: number) => U): U[] {
    return this.getItems().map(callbackfn);
  }

  removeAll(): void {
    this.items.clear();
  }

  count(): number {
    return this.items.size;
  }

  get size(): number {
    return this.items.size;
  }

  values(): IterableIterator<T> {
    return this.items.values();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }
}

export class MyCollectionFactory {
  static create<T extends object>(
    ref: object,
    property?: string,
  ): ICollection<T> {
    if (!property) {
      return new InMemoryCollection<T>();
    }

    try {
      const collection = Collection.create(
        ref as never,
        property as never,
        [],
        true,
      );
      return MyCollectionFactory.createProxy(
        collection as unknown as Collection<T>,
      );
    } catch {
      return new InMemoryCollection<T>();
    }
  }

  static createFrom<T extends object>(target: Collection<any>): ICollection<T> {
    return MyCollectionFactory.createProxy(target) as unknown as ICollection<T>;
  }

  private static createProxy<T extends object>(
    target: Collection<T>,
  ): ICollection<T> {
    //@ts-expect-error - Proxy
    return new Proxy(target, {
      get(target, prop, receiver) {
        if (prop === 'find') {
          return (predicate: (item: T) => boolean): T | undefined => {
            return target.getItems(false).find(predicate);
          };
        }

        if (prop === 'forEach') {
          return (callbackfn: (value: T, index: number) => void): void => {
            return target.getItems(false).forEach(callbackfn);
          };
        }

        if (prop === 'count') {
          return () => {
            return target.isInitialized() ? target.getItems().length : 0;
          };
        }

        if (prop === 'map') {
          return (callbackfn: (value: T, index: number) => any): any[] => {
            return target.getItems(false).map(callbackfn);
          };
        }

        if (prop === 'size') {
          return target.getItems(false).length;
        }

        if (prop === 'values') {
          return () => {
            return target.getItems(false).values();
          };
        }

        if (prop === Symbol.iterator) {
          return function* () {
            yield* target.getItems(false);
          };
        }

        return Reflect.get(target, prop, receiver) as object;
      },
    });
  }
}
