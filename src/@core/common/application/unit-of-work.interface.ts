import { AggregateRoot } from '../domain/aggregate-root';

export const IUNIT_OF_WORK = Symbol('IUnitOfWork');
export interface IUnitOfWork {
  beginTransaction(): Promise<void>;
  completeTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  runTransaction<T>(fn: () => Promise<T>): Promise<T>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  getAggregateRoots(): AggregateRoot[];
}
