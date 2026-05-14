export declare const MERCADO_PAGO_PORT: unique symbol;
export interface CreatePreferenceInput {
    chargeId: string;
    serviceOrderId: string;
    totalCents: number;
}
export interface CreatePreferenceOutput {
    preferenceId: string;
    checkoutUrl: string;
}
export interface GetPaymentOutput {
    mpPaymentId: string;
    status: 'approved' | 'rejected' | 'pending' | 'in_process' | 'cancelled' | 'refunded';
    externalReference: string;
}
export interface IMercadoPagoPort {
    createPreference(input: CreatePreferenceInput): Promise<CreatePreferenceOutput>;
    getPayment(mpPaymentId: string): Promise<GetPaymentOutput>;
}
