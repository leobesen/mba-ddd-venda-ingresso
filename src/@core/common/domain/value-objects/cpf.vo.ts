import { ValueObject } from './value-object';

export class Cpf extends ValueObject<string> {
  constructor(value: string) {
    super(value.replace(/\D/g, ''));
  }

  validate(value: string) {
    if (value.length !== 11) {
      throw new Error('CPF must be 11 characters long');
    }

    const allDigitsAreTheSame = value
      .split('')
      .every((digit) => digit === value[0]);
    if (allDigitsAreTheSame) {
      throw new Error('CPF must have at least one different digit');
    }

    const digits = value.split('').map((digit) => parseInt(digit));

    // Validate 1st Verifier Digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let remainder = sum % 11;
    const firstVerifier = remainder < 2 ? 0 : 11 - remainder;

    if (firstVerifier !== digits[9]) {
      throw new Error('CPF is invalid');
    }

    // Validate 2nd Verifier Digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    remainder = sum % 11;
    const secondVerifier = remainder < 2 ? 0 : 11 - remainder;

    if (secondVerifier !== digits[10]) {
      throw new Error('CPF is invalid');
    }
  }
}
