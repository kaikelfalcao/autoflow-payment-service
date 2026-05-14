export declare class ChargeId {
    readonly value: string;
    constructor(value: string);
    static generate(): ChargeId;
    static fromString(id: string): ChargeId;
    toString(): string;
}
