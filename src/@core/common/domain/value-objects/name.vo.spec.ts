import { Name } from './name.vo';

describe('Name', () => {
  it('Should create a valid name', () => {
    const name = new Name('John Doe');
    expect(name.value).toBe('John Doe');
    expect(() => new Name('Ma')).toThrow(
      'Name must be at least 3 characters long',
    );
  });
});
