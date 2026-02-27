import { Event, EventId } from '../event.entity';
import Partner, { PartnerId } from '../partner.entity';

describe('Event', () => {
  test('Should create an event', () => {
    const partner = Partner.create({ name: 'Partner 1' });
    expect(partner).toBeInstanceOf(Partner);
    expect(partner.id).toBeDefined();
    expect(partner.id).toBeInstanceOf(PartnerId);
    expect(partner.name).toBe('Partner 1');

    const event = partner.initEvent({
      name: 'Concert',
      description: 'A live concert event',
      date: new Date(),
    });
    expect(event).toBeInstanceOf(Event);
    expect(event.id).toBeDefined();
    expect(event.id).toBeInstanceOf(EventId);
    expect(event.name).toBe('Concert');
    expect(event.description).toBe('A live concert event');

    console.log(JSON.stringify(partner.toJSON(), null, 2));
  });
});
