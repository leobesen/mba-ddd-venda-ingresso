# MBA DDD - Venda Ingresso

A ticket-selling system built as a learning project for **Domain-Driven Design (DDD)** with NestJS. This document serves as a DDD development guide — what patterns to apply, where to start, and how everything fits together.

---

## Table of Contents

- [Project Goal](#project-goal)
- [Tech Stack](#tech-stack)
- [Running the Project](#running-the-project)
- [Project Health Check](#project-health-check)
- [Folder Structure & DDD Layers](#folder-structure--ddd-layers)
- [Domain Model](#domain-model)
  - [Value Objects](#value-objects)
  - [Entities and Aggregates](#entities-and-aggregates)
  - [Aggregate Relationships](#aggregate-relationships)
- [Repositories](#repositories)
- [Application Services](#application-services)
- [Domain Events](#domain-events)
- [Integration Events](#integration-events)
- [How It All Works Together](#how-it-all-works-together)
- [Infrastructure](#infrastructure)
- [Development Flow (How This Was Built)](#development-flow-how-this-was-built)
- [DDD Patterns: What to Do and Where to Start](#ddd-patterns-what-to-do-and-where-to-start)
- [Known Issues & TODOs](#known-issues--todos)

---

## Project Goal

This project models a **ticket-selling domain**: partners create events with sections and spots, customers reserve spots, orders are placed and paid. The goal is not production-readiness but to learn DDD building blocks hands-on: aggregates, value objects, repositories, domain events, integration events, and the application service pattern.

---

## Tech Stack

| Category        | Technology                          |
| --------------- | ----------------------------------- |
| Framework       | NestJS 11                           |
| Language        | TypeScript 5.7                      |
| ORM             | MikroORM 6 (MySQL)                  |
| Database        | MySQL 8.0                           |
| Job Queue       | Bull + Redis 7.0                    |
| Message Broker  | RabbitMQ 3.8                        |
| Event Bus       | EventEmitter2                       |
| Validation      | class-validator / class-transformer |
| Monorepo        | NestJS CLI multi-app                |
| Package Manager | pnpm                                |
| Test Runner     | Jest + SWC                          |

---

## Running the Project

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts MySQL, Redis, and RabbitMQ.

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run database migrations

```bash
pnpm mikro-orm migration:up
```

### 4. Start the main application

```bash
pnpm start:dev
```

### 5. Start the email consumer app

```bash
pnpm start:dev email
```

### Run tests

```bash
pnpm test
pnpm test:e2e
pnpm test:cov
```

---

## Project Health Check

To diagnose configuration issues or verify NestJS setup:

```bash
npx nestjs-doctor@latest .
```

This tool inspects your NestJS project for common misconfigurations, version mismatches, and missing setup.

---

## Folder Structure & DDD Layers

This project follows a clean layered architecture inside the NestJS monorepo:

```
apps/
├── mba-ddd-venda-ingresso/         # Main API application
│   └── src/
│       ├── @core/                  # DDD core — the heart of the system
│       │   ├── common/             # Shared building blocks
│       │   │   ├── domain/         # Base classes: Entity, AggregateRoot, ValueObject
│       │   │   ├── application/    # ApplicationService, IUnitOfWork, IDomainEventHandler
│       │   │   └── infra/          # UnitOfWorkMikroOrm implementation
│       │   └── events/             # The "Events" bounded context
│       │       ├── domain/         # Aggregates, entities, value objects, repos, events
│       │       ├── application/    # Use-case services, handlers
│       │       └── infra/db/       # MikroORM schemas, custom types, repositories
│       ├── events/                 # Presentation layer (controllers, DTOs)
│       ├── application/            # ApplicationModule wiring
│       ├── database/               # DatabaseModule (UnitOfWork provider)
│       ├── domain-events/          # IntegrationEventsPublisher (Bull processor)
│       ├── rabbitmq/               # RabbitmqModule
│       └── app.module.ts           # Root module
└── email/                          # Email consumer application
    └── src/
        ├── consumer.service.ts     # RabbitMQ message consumer
        └── email.module.ts
```

### The layering rule

**Dependencies flow inward only:**

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain** (`@core/.../domain/`): No framework dependencies. Pure TypeScript classes.
- **Application** (`@core/.../application/`): Orchestrates domain objects. Depends on domain interfaces only.
- **Infrastructure** (`@core/.../infra/`, `database/`, `rabbitmq/`): Implements interfaces defined in domain/application.
- **Presentation** (`events/`): NestJS controllers, DTOs. Calls application services.

---

## Domain Model

### Value Objects

Value objects are **immutable**, validated at construction, and compared by value — not by reference.

**Base class** (`value-objects/value-object.ts`):

- Deep-freezes itself on construction
- `equals()` uses lodash `isEqual` for structural comparison
- Subclasses implement `validate()` and throw on invalid input

| Value Object | File         | Rules                                                                                                               |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `Uuid`       | `uuid.vo.ts` | Validates UUID v4 format. Base for all IDs.                                                                         |
| `Cpf`        | `cpf.vo.ts`  | Brazilian CPF: strips formatting, validates length, checks mod-11 digit algorithm, rejects all-same-digit sequences |
| `Name`       | `name.vo.ts` | Minimum 3 characters                                                                                                |

All aggregate IDs extend `Uuid`:

```
Uuid
├── PartnerId
├── EventId
├── EventSectionId
├── EventSpotId
├── CustomerId
└── OrderId
```

**Start here in a new DDD project**: define your value objects first. They are your domain's validation layer and type safety.

---

### Entities and Aggregates

An **Entity** has an identity and mutable state. An **Aggregate Root** is an entity that owns a consistency boundary — all writes to the aggregate go through its root.

#### AggregateRoot base class (`aggregate-root.ts`)

```typescript
abstract class AggregateRoot<TId> extends Entity<TId> {
  events: Set<IDomainEvent> = new Set();
  addEvent(event: IDomainEvent) { ... }
  clearEvents() { ... }
}
```

---

#### Partner (Aggregate Root)

The simplest aggregate. A partner organizes events.

| Property | Type        | Description  |
| -------- | ----------- | ------------ |
| `id`     | `PartnerId` | Identity     |
| `name`   | `string`    | Partner name |

**Behavior:**

- `Partner.create(command)` — factory method; adds `PartnerCreated` domain event
- `changeName(newName)` — adds `PartnerChangedName` domain event
- `initEvent(command)` — creates an Event aggregate for this partner

---

#### Customer (Aggregate Root)

A person who buys tickets.

| Property | Type         | Description                                |
| -------- | ------------ | ------------------------------------------ |
| `id`     | `CustomerId` | Identity                                   |
| `name`   | `string`     | Full name                                  |
| `cpf`    | `Cpf`        | Brazilian tax ID (value object, validated) |

---

#### Event (Aggregate Root)

An event (show, conference, etc.) composed of sections and spots. This is the most complex aggregate.

| Property               | Type                        | Description            |
| ---------------------- | --------------------------- | ---------------------- |
| `id`                   | `EventId`                   | Identity               |
| `name`                 | `string`                    | Event name             |
| `description`          | `string \| null`            | Optional description   |
| `date`                 | `Date`                      | When the event happens |
| `is_published`         | `boolean`                   | Visibility flag        |
| `total_spots`          | `number`                    | Derived from sections  |
| `total_spots_reserved` | `number`                    | Count of reservations  |
| `partner_id`           | `PartnerId`                 | Owning partner         |
| `sections`             | `ICollection<EventSection>` | Composition            |

**Behavior:**

- `addSection(command)` — creates `EventSection` with auto-initialized spots
- `publishAll()` / `unpublishAll()` — cascades to all sections and spots
- `allowReserveSpot(sectionId, spotId)` — validates spot is available and published
- `markSpotAsReserved(sectionId, spotId)` — increments reservation counters

---

#### EventSection (Entity, owned by Event)

Represents a zone inside the event (e.g., "VIP", "General").

| Property      | Type                     | Description     |
| ------------- | ------------------------ | --------------- |
| `id`          | `EventSectionId`         | Identity        |
| `name`        | `string`                 | Section name    |
| `price`       | `number`                 | Ticket price    |
| `total_spots` | `number`                 | Number of spots |
| `spots`       | `ICollection<EventSpot>` | Composition     |

---

#### EventSpot (Entity, owned by EventSection)

A single physical seat or spot.

| Property       | Type             | Description      |
| -------------- | ---------------- | ---------------- |
| `id`           | `EventSpotId`    | Identity         |
| `location`     | `string \| null` | Seat label       |
| `is_reserved`  | `boolean`        | Reservation flag |
| `is_published` | `boolean`        | Visibility flag  |

---

#### Order (Aggregate Root)

Represents a ticket purchase.

| Property        | Type          | Description                    |
| --------------- | ------------- | ------------------------------ |
| `id`            | `OrderId`     | Identity                       |
| `customer_id`   | `CustomerId`  | Who placed the order           |
| `event_spot_id` | `EventSpotId` | What was purchased             |
| `amount`        | `number`      | Amount charged                 |
| `status`        | `OrderStatus` | `PENDING`, `PAID`, `CANCELLED` |

**Behavior:** `pay()`, `cancel()`

---

#### SpotReservation (Entity)

A lock on an event spot for a customer. Prevents double-booking.

| Property           | Type          | Description   |
| ------------------ | ------------- | ------------- |
| `spot_id`          | `EventSpotId` | Composite PK  |
| `customer_id`      | `CustomerId`  | Who reserved  |
| `reservation_date` | `Date`        | When reserved |

---

### Aggregate Relationships

```
Partner (AggregateRoot)
└── [creates] → Event (AggregateRoot)
                └── EventSection (Entity)       [owned, cascaded]
                    └── EventSpot (Entity)       [owned, cascaded]

Customer (AggregateRoot)
└── [places] → Order (AggregateRoot)
                    └── references EventSpot (by ID, not object)

SpotReservation (Entity)
└── references EventSpot (by ID)
└── references Customer (by ID)
```

**Key DDD rule:** Aggregates reference other aggregates **by ID only**, not by object reference. `Order` holds a `CustomerId` and `EventSpotId` — it does not hold `Customer` or `EventSpot` objects.

---

## Repositories

The repository pattern isolates the domain from persistence. The domain defines the **interface**; infrastructure provides the **implementation**.

### Interface pattern

```typescript
// @core/common/domain/repository-interface.ts
interface IRepository<E> {
  add(entity: E): Promise<void>;
  findById(id: any): Promise<E | null>;
  findAll(): Promise<E[]>;
  delete(entity: E): Promise<void>;
}
```

### Repository interfaces (domain layer)

| Interface                    | File                                                    |
| ---------------------------- | ------------------------------------------------------- |
| `IPartnerRepository`         | `repositories/partner-repository.interface.ts`          |
| `IEventRepository`           | `repositories/event-repository.interface.ts`            |
| `ICustomerRepository`        | `repositories/customer-repository.interface.ts`         |
| `IOrderRepository`           | `repositories/order-repository.interface.ts`            |
| `ISpotReservationRepository` | `repositories/spot-reservation-repository.interface.ts` |

All interfaces are defined in the **domain layer** — they have no knowledge of MikroORM or MySQL.

### Repository implementations (infrastructure layer)

Located in `@core/events/infra/db/repositories/`. Each repository receives an `EntityManager` from MikroORM.

```typescript
// Example: PartnerMysqlRepository
export class PartnerMysqlRepository implements IPartnerRepository {
  constructor(private entityManager: EntityManager) {}

  add(entity: Partner): Promise<void> {
    this.entityManager.persist(entity);
    return Promise.resolve(); // flush happens in UnitOfWork
  }

  findById(id: string | PartnerId): Promise<Partner | null> {
    return this.entityManager.findOne(Partner, {
      id: typeof id === 'string' ? new PartnerId(id) : id,
    });
  }
}
```

Note that `add()` does **not flush** — that is delegated to the `UnitOfWork`. This keeps the transaction boundary at the application service level.

### Binding interfaces to implementations (NestJS DI)

Interfaces are bound via injection tokens (symbols) in the module:

```typescript
// In DatabaseModule or EventsModule:
{ provide: IPARTNER_REPOSITORY, useFactory: (em) => new PartnerMysqlRepository(em), inject: [EntityManager] }
```

---

## Application Services

Application services orchestrate domain objects to fulfill use cases. They do not contain business rules — those live in aggregates and domain services.

### ApplicationService (base class)

`@core/common/application/application.service.ts` — the template for all transactional use cases:

```
start()  → begins DB transaction
  ↓
[execute business logic]
  ↓
finish() → publish domain events
         → commit to DB
         → publish integration events
  ↓
fail()   → rollback transaction
```

`run<T>(fn)` wraps this pattern for convenience:

```typescript
async run<T>(fn: () => Promise<T>): Promise<T> {
  await this.start();
  try {
    const result = await fn();
    await this.finish();
    return result;
  } catch (e) {
    await this.fail();
    throw e;
  }
}
```

### Use-case services

| Service           | Responsibility                              |
| ----------------- | ------------------------------------------- |
| `PartnerService`  | create, list, update partners               |
| `EventService`    | create events, add sections, publish        |
| `CustomerService` | create, list, update customers              |
| `OrderService`    | reserve spot, process payment, create order |
| `PaymentGateway`  | simulates external payment processing       |

`OrderService.create()` is the most complex use case — it:

1. Loads customer and event
2. Checks the spot is available and not already reserved
3. Calls `PaymentGateway.processPayment()`
4. Creates `SpotReservation`
5. Marks the spot as reserved on the `Event` aggregate
6. Creates the `Order` with status `PAID`
7. All inside a single `UnitOfWork` transaction

### Unit of Work

`IUnitOfWork` manages the transaction boundary and tracks aggregate roots:

```typescript
interface IUnitOfWork {
  beginTransaction(): Promise<void>;
  completeTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  getAggregateRoots(): AggregateRoot<any>[];
}
```

`UnitOfWorkMikroOrm` wraps MikroORM's `EntityManager`. `getAggregateRoots()` returns entities from the persist/remove stacks — used by `ApplicationService.finish()` to collect domain events.

---

## Domain Events

Domain events record that something meaningful happened inside the domain. They are raised by aggregates, not by services.

### IDomainEvent interface

```typescript
interface IDomainEvent {
  aggregate_id: ValueObject;
  occurred_on: Date;
  event_version: number;
}
```

### Events in this project

| Event                | Raised by              | When                        |
| -------------------- | ---------------------- | --------------------------- |
| `PartnerCreated`     | `Partner.create()`     | A new partner is registered |
| `PartnerChangedName` | `Partner.changeName()` | A partner renames itself    |

### How aggregates raise events

```typescript
// Inside Partner.create():
const partner = new Partner({ id: new PartnerId(), name });
partner.addEvent(new PartnerCreated({ partner_id: partner.id, name }));
return partner;
```

The aggregate accumulates events in `this.events: Set<IDomainEvent>`. They are not dispatched until `ApplicationService.finish()` is called.

### DomainEventManager

`@core/common/domain/domain-event-manager.ts` uses `EventEmitter2` with two independent emitter channels:

1. **`domainEventsSubscriber`** — for in-process domain event handlers
2. **`integrationEventsSubscriber`** — for integration event publishers (cross-service)

```typescript
// Register a handler
domainEventManager.register('PartnerCreated', myHandlerInstance);

// Publish after commit
domainEventManager.publish(aggregateRoot); // fires domain handlers
domainEventManager.publishForIntegrationEvent(aggregateRoot); // fires integration publishers
```

### Domain event handlers

Implement `IDomainEventHandler`:

```typescript
interface IDomainEventHandler {
  handle(event: IDomainEvent): Promise<void>;
}
```

Handlers are registered in `EventsModule.onModuleInit()`. Currently only `MyHandlerHandler` exists as a placeholder for `PartnerCreated`.

---

## Integration Events

Integration events cross service/process boundaries. They are a separate concept from domain events — they carry only the data needed by consumers, not the full domain state.

### IIntegrationEvent interface

```typescript
interface IIntegrationEvent<T = any> {
  event_name: string;
  payload: T;
  event_version: number;
  occurred_on: Date;
}
```

### Events in this project

| Integration Event                | Mapped from      | Consumer  | Purpose            |
| -------------------------------- | ---------------- | --------- | ------------------ |
| `PartnerCreatedIntegrationEvent` | `PartnerCreated` | Email app | Send welcome email |

### Pipeline: Domain Event → RabbitMQ

```
1. Partner.create() adds PartnerCreated to aggregate.events

2. ApplicationService.finish():
   a. DomainEventManager.publish(aggregate)        → fires in-process handlers
   b. UnitOfWork.commit()                          → flushes to MySQL
   c. DomainEventManager.publishForIntegrationEvent(aggregate)
      → enqueues job to Bull queue "integration-events"

3. IntegrationEventsPublisher (Bull @Processor):
   → reads job, calls AmqpConnection.publish()
   → publishes to RabbitMQ exchange: amq.direct
   → routing key: "PartnerCreatedIntegrationEvent"

4. Email app ConsumerService:
   → @RabbitSubscribe({ exchange: 'amq.direct', routingKey: 'PartnerCreatedIntegrationEvent' })
   → handles message (logs / sends email)
```

The Bull queue acts as a **reliable buffer** between the database commit and the RabbitMQ publish. If RabbitMQ is unavailable, the job stays in Redis and retries — preventing lost events.

---

## How It All Works Together

This sequence covers the "create partner" use case end-to-end:

```
HTTP POST /partners
    ↓
PartnersController.create(dto)
    ↓
PartnerService.create(input)
    ↓
ApplicationService.run(fn):
    ├─ UnitOfWork.beginTransaction()
    ├─ Partner.create({ name }) → PartnerCreated event queued in aggregate
    ├─ PartnerRepository.add(partner) → EntityManager.persist(partner)
    ├─ ApplicationService.finish():
    │   ├─ DomainEventManager.publish(partner)
    │   │   └─ MyHandlerHandler.handle(PartnerCreated) → console.log
    │   ├─ UnitOfWork.commit() → EntityManager.flush() → SQL INSERT
    │   └─ DomainEventManager.publishForIntegrationEvent(partner)
    │       └─ Bull queue: enqueue { event_name: 'PartnerCreatedIntegrationEvent', payload: {...} }
    └─ return partner

IntegrationEventsPublisher (Bull Worker):
    └─ AmqpConnection.publish('amq.direct', 'PartnerCreatedIntegrationEvent', payload)

Email App ConsumerService:
    └─ @RabbitSubscribe handler → "Received PartnerCreatedIntegrationEvent"
```

---

## Infrastructure

### Database: MikroORM + MySQL

MikroORM is configured to work with DDD entities using `EntitySchema` (not decorators). This keeps the domain layer free of ORM annotations.

**Key config option:** `forceEntityConstructor: true` — required so MikroORM calls the entity constructor when hydrating from the database, which triggers value object creation.

**Custom schema types** map value objects to database columns:

```
apps/.../infra/db/types/
├── uuid.schema-type.ts          → Uuid ↔ VARCHAR(36)
├── cpf.schema-type.ts           → Cpf ↔ VARCHAR(11)
├── partner-id.schema-type.ts    → PartnerId ↔ VARCHAR(36)
└── ...
```

**Entity schemas** (`schemas.ts`) declare all ORM mappings without touching domain classes:

```typescript
export const PartnerSchema = new EntitySchema({
  class: Partner,
  properties: {
    id: { customType: new PartnerIdSchemaType(), primary: true },
    name: { type: 'string' },
    events: { persist: false, hidden: true }, // domain events not persisted
  },
});
```

Note: `events` is marked `persist: false` — MikroORM will not try to save the domain events Set to the database.

### Job Queue: Bull + Redis

Bull provides a Redis-backed job queue for reliable async processing:

- Queue name: `integration-events`
- Registered in `AppModule` with `BullModule.forRoot({ redis: { host, port } })`
- `IntegrationEventsPublisher` is decorated with `@Processor('integration-events')`
- Jobs are enqueued in `DomainEventManager` after the DB commit

### Message Broker: RabbitMQ

- Exchange: `amq.direct` (built-in direct exchange)
- Library: `@golevelup/nestjs-rabbitmq`
- The main app **publishes** to the exchange
- The email app **subscribes** with routing key = event name

RabbitMQ management UI: http://localhost:15672 (admin / admin)

### Docker Compose Services

| Service  | Image                          | Port        |
| -------- | ------------------------------ | ----------- |
| MySQL    | mysql:8.0.30-debian            | 3306        |
| Redis    | redis:7.0.8-alpine             | 6379        |
| RabbitMQ | rabbitmq:3.8-management-alpine | 5672, 15672 |

---

## Development Flow (How This Was Built)

Following the commit history, this is the incremental order used to build the project. Use this as a guide for starting a new DDD project:

### Phase 1 — Domain model (no framework)

1. Define value objects (`Uuid`, `Cpf`, `Name`)
2. Implement `Entity` and `AggregateRoot` base classes
3. Model aggregates and entities: `Partner`, `Customer`, `Event`, `EventSection`, `EventSpot`, `Order`, `SpotReservation`
4. Define repository **interfaces** (no implementations yet)
5. Write domain logic (invariants, factory methods, state transitions)

### Phase 2 — Infrastructure (ORM)

6. Configure MikroORM with MySQL (`mikro-orm.config.ts`)
7. Write `EntitySchema` definitions for each aggregate
8. Create custom schema types for value objects
9. Implement repository classes using `EntityManager`
10. Implement `UnitOfWorkMikroOrm`
11. Create `DatabaseModule` and wire providers

### Phase 3 — Application layer

12. Implement `ApplicationService` (transaction + event orchestration template)
13. Implement use-case services: `PartnerService`, `CustomerService`, `EventService`, `OrderService`
14. Implement `PaymentGateway` (stub)
15. Create `ApplicationModule`

### Phase 4 — Presentation layer

16. Add `ValidationPipe` globally
17. Implement controllers: `PartnersController`, `CustomersController`, `EventsController`, `OrdersController`
18. Add DTOs with class-validator decorators
19. Register in `EventsModule`

### Phase 5 — Domain events

20. Define `IDomainEvent` interface
21. Add `addEvent()` to `AggregateRoot`
22. Create `PartnerCreated` and `PartnerChangedName` events; raise them in `Partner`
23. Implement `DomainEventManager` with `EventEmitter2`
24. Define `IDomainEventHandler`; implement `MyHandlerHandler`
25. Wire `DomainEventsModule` and register handlers in `EventsModule.onModuleInit()`
26. Integrate publishing into `ApplicationService.finish()`

### Phase 6 — Integration events

27. Define `IIntegrationEvent` interface
28. Create `PartnerCreatedIntegrationEvent`
29. Add Redis + RabbitMQ to `docker-compose.yaml`
30. Configure `BullModule` and `RabbitmqModule`
31. Implement `IntegrationEventsPublisher` (Bull processor → RabbitMQ publish)
32. Generate `email` app with `nest generate app`
33. Implement `ConsumerService` with `@RabbitSubscribe`

---

## DDD Patterns: What to Do and Where to Start

### Starting a new DDD project

1. **Understand the domain first.** Talk to domain experts. Draw the bounded contexts before writing code.
2. **Define your value objects.** They encode validation and domain language. Write them before entities.
3. **Model aggregates with their invariants.** What rules must always be true? That belongs in the aggregate.
4. **Define repository interfaces in the domain.** Never let the domain know about MySQL or any ORM.
5. **Write application services last.** They are thin orchestrators — if they contain business logic, move it to the aggregate.
6. **Raise domain events from aggregates, not from services.** The aggregate decides what happened.
7. **Separate domain events from integration events.** Domain events are internal. Integration events are contracts for other services.

### Where things go (quick reference)

| What                              | Where                                  |
| --------------------------------- | -------------------------------------- |
| Business rules and invariants     | Aggregate methods                      |
| Identity and validation           | Value objects                          |
| Data access contract              | Repository interface (domain layer)    |
| Data access implementation        | Repository class (infra layer)         |
| Use case orchestration            | Application service                    |
| Transaction boundary              | UnitOfWork                             |
| "Something happened" notification | Domain event (in-process)              |
| Cross-service notification        | Integration event (via message broker) |
| HTTP routing, request parsing     | Controller (presentation layer)        |

---