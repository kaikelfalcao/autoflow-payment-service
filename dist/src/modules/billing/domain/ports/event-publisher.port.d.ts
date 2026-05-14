export declare const EVENT_PUBLISHER_PORT: unique symbol;
export interface PaymentApprovedEvent {
    type: 'payment.approved';
    serviceOrderId: string;
    chargeId: string;
    mpPaymentId: string;
}
export interface PaymentRejectedEvent {
    type: 'payment.rejected';
    serviceOrderId: string;
    chargeId: string;
    mpPaymentId: string;
    reason: string;
}
export interface PaymentRefundedEvent {
    type: 'payment.refunded';
    serviceOrderId: string;
    chargeId: string;
    mpPaymentId: string;
    reason?: string;
}
export type PaymentResultEvent = PaymentApprovedEvent | PaymentRejectedEvent | PaymentRefundedEvent;
export interface IEventPublisher {
    publishPaymentResult(event: PaymentResultEvent): Promise<void>;
}
