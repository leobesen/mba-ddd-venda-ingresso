import { IUnitOfWork } from 'src/@core/common/application/unit-of-work.interface';
import { Order } from '../domain/entities/order.entity';
import { IOrderRepository } from '../domain/repositories/order-repository.interface';
import { ICustomerRepository } from '../domain/repositories/customer-repository.interface';
import { IEventRepository } from '../domain/repositories/event-repository.interface';
import { EventSectionId } from '../domain/entities/event-section';
import { EventSpotId } from '../domain/entities/event-spot';
import { ISpotReservationRepository } from '../domain/repositories/spot-reservation-repository.interface';
import { SpotReservation } from '../domain/entities/spot-reservation.entity';
import { PaymentGateway } from './payment.gateway';

export class OrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private customerRepository: ICustomerRepository,
    private eventRepository: IEventRepository,
    private spotReservationRepository: ISpotReservationRepository,
    private paymentGateway: PaymentGateway,
    private uow: IUnitOfWork,
  ) {}

  list() {
    return this.orderRepository.findAll();
  }

  async create(input: {
    event_id: string;
    section_id: string;
    spot_id: string;
    customer_id: string;
    card_token: string;
  }) {
    const customer = await this.customerRepository.findById(input.customer_id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const event = await this.eventRepository.findById(input.event_id);
    if (!event) {
      throw new Error('Event not found');
    }

    const sectionId = new EventSectionId(input.section_id);
    const spotId = new EventSpotId(input.spot_id);
    if (!event.allowReserveSpot({ section_id: sectionId, spot_id: spotId })) {
      throw new Error('Spot cannot be reserved');
    }

    const spotReservation =
      await this.spotReservationRepository.findById(spotId);
    if (spotReservation) {
      throw new Error('Spot is already reserved');
    }

    return this.uow.runTransaction(async () => {
      const spotReservationCreated = SpotReservation.create({
        spot_id: spotId,
        customer_id: customer.id,
      });

      await this.spotReservationRepository.add(spotReservationCreated);

      try {
        await this.uow.commit();

        const section = event.sections.find((s) => s.id.equals(sectionId));

        await this.paymentGateway.payment({
          token: input.card_token,
          amount: section ? section.price : 0,
        });

        const order = Order.create({
          customer_id: customer.id,
          event_spot_id: spotId,
          amount: section ? section.price : 0,
        });

        order.pay();

        await this.orderRepository.add(order);

        event.markSpotAsReserved({ section_id: sectionId, spot_id: spotId });
        await this.eventRepository.add(event);

        await this.uow.commit();

        return order;
      } catch (e) {
        console.log(e);
        const section = event.sections.find((s) => s.id.equals(sectionId));
        const order = Order.create({
          customer_id: customer.id,
          event_spot_id: spotId,
          amount: section ? section.price : 0,
        });
        order.cancel();
        await this.orderRepository.add(order);
        await this.uow.commit();
        throw new Error('Failed to reserve spot');
      }
    });
  }
}
