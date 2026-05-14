export declare class WebhookEventOrmEntity {
    id: string;
    chargeId: string;
    serviceOrderId: string;
    mpPaymentId: string;
    action: string;
    status: string;
    rawPayload: Record<string, unknown>;
    processedAt: Date;
}
