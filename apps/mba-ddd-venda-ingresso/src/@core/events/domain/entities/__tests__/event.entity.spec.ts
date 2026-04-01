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
      total_spots: 5,
    });
    expect(event.sections.size).toBe(1);
    expect(event.total_spots).toBe(5);
    expect(event.sections.values().next().value).toBeInstanceOf(EventSection);

    const [section] = event.sections;
    expect(section.spots.size).toBe(5);

    console.log(JSON.stringify(event.toJSON(), null, 2));
  });

  test('Should publish all items in the event', () => {
    const event = Event.create({
      name: 'Concert',
      description: 'A live concert event',
      date: new Date(),
      partner_id: new PartnerId(),
    });

    event.addSection({
      name: 'VIP',
      description: 'VIP section with exclusive benefits',
      price: 100,
      total_spots: 5,
    });

    event.addSection({
      name: 'General Admission',
      description: 'General admission section',
      price: 50,
      total_spots: 5,
    });

    event.publishAll();
    expect(event.is_published).toBe(true);
    const [section1, section2] = event.sections;
    expect(section1.is_published).toBe(true);
    expect(section2.is_published).toBe(true);
    [...section1.spots, ...section2.spots].forEach((spot) => {
      expect(spot.is_published).toBe(true);
    });

    console.log(JSON.stringify(event.toJSON(), null, 2));
  });
});
