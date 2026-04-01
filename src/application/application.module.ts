import { Module } from '@nestjs/common';
import { ApplicationService } from '../@core/common/application/application.service';
import { DomainEventManager } from '../@core/common/domain/domain-event-manager';
import {
  IUNIT_OF_WORK,
  IUnitOfWork,
} from '../@core/common/application/unit-of-work.interface';

@Module({
  providers: [
    {
      provide: ApplicationService,
      useFactory: (
        uow: IUnitOfWork,
        domainEventManager: DomainEventManager,
      ) => {
        return new ApplicationService(uow, domainEventManager);
      },
      inject: [IUNIT_OF_WORK, DomainEventManager],
    },
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
