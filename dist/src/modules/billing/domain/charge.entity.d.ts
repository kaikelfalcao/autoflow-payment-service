import type { ChargeId } from './value-objects/charge-id.vo';
import type { ChargeStatus } from './value-objects/charge-status.vo';
export interface ChargeProps {
    id: ChargeId;
    serviceOrderId: string;
    customerId: string;
    totalCents: number;
    status: ChargeStatus;
    mpPreferenceId: string | null;
    mpPaymentId: string | null;
    checkoutUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateChargeProps {
    id: ChargeId;
    serviceOrderId: string;
    customerId: string;
    totalCents: number;
}
export declare class Charge {
    private readonly _id;
    private readonly _serviceOrderId;
    private readonly _customerId;
    private readonly _totalCents;
    private _status;
    private _mpPreferenceId;
    private _mpPaymentId;
    private _checkoutUrl;
    private readonly _createdAt;
    private _updatedAt;
    private constructor();
    static create(props: CreateChargeProps): Charge;
    static restore(props: ChargeProps): Charge;
    attachPreference(mpPreferenceId: string, checkoutUrl: string): void;
    approve(mpPaymentId: string): void;
    reject(mpPaymentId: string): void;
    expire(): void;
    refund(): void;
    private ensurePending;
    get id(): ChargeId;
    get serviceOrderId(): string;
    get customerId(): string;
    get totalCents(): number;
    get status(): ChargeStatus;
    get mpPreferenceId(): string | null;
    get mpPaymentId(): string | null;
    get checkoutUrl(): string | null;
    get createdAt(): Date;
    get updatedAt(): Date;
}
