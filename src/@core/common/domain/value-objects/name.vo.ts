import { ValueObject } from "./value-object";

export class NameVO extends ValueObject<string> {
    constructor(value: string) {
        super(value);
    }

    validate(value: string) {
        if (value.length < 3) {
            throw new Error('Name must be at least 3 characters long');
        }
    }
}