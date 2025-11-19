import { NameVO } from "./name.vo";
import { Customer } from "../../../events/domain/entities/customer.entity";

test('Should create a valid name', () => {
    const name = new NameVO('John Doe');
    expect(name.value).toBe('John Doe');

    const customer = new Customer({
        id: '1',
        cpf: '12345678901',
        name: name,
    });
    expect(customer.name.value).toBe('John Doe');

    expect(() => new NameVO('Ma')).toThrow('Name must be at least 3 characters long');
});