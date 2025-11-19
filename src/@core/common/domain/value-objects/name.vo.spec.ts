import { NameVO } from "./name.vo";

describe('NameVO', () => {
    it('Should create a valid name', () => {
        const name = new NameVO('John Doe');
        expect(name.value).toBe('John Doe');
        expect(() => new NameVO('Ma')).toThrow('Name must be at least 3 characters long');
    });
});