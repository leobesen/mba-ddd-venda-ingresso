import { Customer, CustomerId } from '../customer.entity';

describe('Customer', () => {
  test('Should create a client', () => {
    const customer = Customer.create({
      name: 'John Doe',
      cpf: '502.908.050-31',
    });
    expect(customer).toBeInstanceOf(Customer);
    expect(customer.id).toBeDefined();
    expect(customer.id).toBeInstanceOf(CustomerId);
    expect(customer.name).toBe('John Doe');
    expect(customer.cpf.value).toBe('50290805031');
  });
});
