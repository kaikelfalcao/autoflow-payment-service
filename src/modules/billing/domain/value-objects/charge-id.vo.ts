import { v4 as uuidv4 } from 'uuid';

export class ChargeId {
  constructor(readonly value: string) {}

  static generate(): ChargeId {
    return new ChargeId(uuidv4());
  }

  static fromString(id: string): ChargeId {
    return new ChargeId(id);
  }

  toString(): string {
    return this.value;
  }
}
