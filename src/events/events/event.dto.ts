import { Type } from 'class-transformer';

export class EventDTO {
  name!: string;
  description!: string | null;
  @Type(() => Date)
  date!: Date;
  partner_id!: string;
}

export class CreateEventSectionDTO {
  name!: string;
  description!: string | null;
  total_spots!: number;
  price!: number;
}

export class UpdateEventSectionDTO {
  name!: string;
  description?: string | null;
}
