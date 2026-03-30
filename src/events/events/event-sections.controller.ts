import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { EventService } from 'src/@core/events/application/event.service';
import { CreateEventSectionDTO, UpdateEventSectionDTO } from './event.dto';

@Controller('events/:event_id/sections')
export class EventSectionsController {
  constructor(private eventService: EventService) {}

  @Get()
  async list(@Param('event_id') eventId: string) {
    return this.eventService.findSections(eventId);
  }

  @Post()
  create(
    @Param('event_id') eventId: string,
    @Body() createEventSectionDto: CreateEventSectionDTO,
  ) {
    return this.eventService.addSection({
      ...createEventSectionDto,
      event_id: eventId,
    });
  }

  @Put(':section_id')
  update(
    @Param('event_id') eventId: string,
    @Param('section_id') sectionId: string,
    @Body() updateEventSectionDto: UpdateEventSectionDTO,
  ) {
    return this.eventService.updateSection({
      ...updateEventSectionDto,
      event_id: eventId,
      section_id: sectionId,
    });
  }
}
