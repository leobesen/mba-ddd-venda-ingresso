import { EventSection } from '../event-section';
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

    event.addSection({
      name: 'VIP',
      description: 'VIP section with exclusive benefits',
      price: 100,
      total_spots: 50,
    });
    expect(event.sections.size).toBe(1);
    expect(event.total_spots).toBe(50);
    expect(event.sections.values().next().value).toBeInstanceOf(EventSection);

    const [section] = event.sections;
    expect(section.spots.size).toBe(50);

    console.log(JSON.stringify(event.toJSON(), null, 2));
  });
});
