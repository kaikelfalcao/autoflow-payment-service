import type { ChargeStatus } from '../../domain/value-objects/charge-status.vo';
export declare class ChargeOrmEntity {
    id: string;
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
