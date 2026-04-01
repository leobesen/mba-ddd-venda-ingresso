import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { EventService } from 'apps/mba-ddd-venda-ingresso/src/@core/events/application/event.service';
import { EventDTO } from './event.dto';

@Controller('events')
export class EventsController {
  constructor(private eventService: EventService) {}

  @Get()
  async list() {
    return await this.eventService.findEvents();
  }

  @Post()
  create(
    @Body()
    body: EventDTO,
  ) {
    return this.eventService.create(body);
  }

  @Put(':event_id/publish-all')
  publishAll(@Param('event_id') event_id: string) {
    return this.eventService.publishAll({ event_id: event_id });
  }
}
