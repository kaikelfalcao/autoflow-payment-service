import type { Charge } from '../../../domain/charge.entity';
export declare class ChargeResponseDto {
    chargeId: string;
    serviceOrderId: string;
    customerId: string;
    totalCents: number;
    status: string;
    checkoutUrl: string | null;
    mpPreferenceId: string | null;
    mpPaymentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    static fromDomain(charge: Charge): ChargeResponseDto;
}
