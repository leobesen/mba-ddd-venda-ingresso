import { Cpf } from './cpf.vo';

describe('Cpf', () => {
  it('should create a valid CPF', () => {
    const validCpf = '52998224725';
    const cpf = new Cpf(validCpf);
    expect(cpf.value).toBe(validCpf);
  });

  it('should throw an error if CPF length is not 11', () => {
    expect(() => new Cpf('123')).toThrow('CPF must be 11 characters long');
    expect(() => new Cpf('123456789012')).toThrow(
      'CPF must be 11 characters long',
    );
  });

  it('should throw an error if all digits are the same', () => {
    expect(() => new Cpf('11111111111')).toThrow(
      'CPF must have at least one different digit',
    );
  });

  it('should throw an error if CPF is invalid (first verifier digit)', () => {
    // 529982247 2 5 is valid. Change first verifier (2) to 3.
    expect(() => new Cpf('52998224735')).toThrow('CPF is invalid');
  });

  it('should throw an error if CPF is invalid (second verifier digit)', () => {
    // 529982247 2 5 is valid. Change second verifier (5) to 6.
    expect(() => new Cpf('52998224726')).toThrow('CPF is invalid');
  });
});
