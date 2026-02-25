import { EventSection } from '../event-section';
import { EventSpot } from '../event-spot';
import { Event, EventId } from '../event.entity';
import { PartnerId } from '../partner.entity';

describe('Event', () => {
  test('Should create an event', () => {
    const event = Event.create({
      name: 'Concert',
      description: 'A live concert event',
      date: new Date(),
      partner_id: new PartnerId(),
    });
    expect(event).toBeInstanceOf(Event);
    expect(event.id).toBeDefined();
    expect(event.id).toBeInstanceOf(EventId);
    expect(event.name).toBe('Concert');
    expect(event.description).toBe('A live concert event');

    const section = new EventSection({
      name: 'VIP',
      description: 'VIP section with exclusive benefits',
      price: 100,
      total_spots: 50,
      total_spots_reserved: 0,
      is_published: false,
      spots: new Set<EventSpot>(),
    });
    event.sections.add(section);
    expect(event.sections.has(section)).toBe(true);

    const spot = new EventSpot({
      location: 'A1',
      is_published: false,
      is_reserved: false,
    });
    section.spots.add(spot);
    expect(section.spots.has(spot)).toBe(true);

    console.log(JSON.stringify(event.toJSON(), null, 2));
  });
});
