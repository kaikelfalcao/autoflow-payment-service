import type { IEventPublisher, PaymentResultEvent } from '../../domain/ports/event-publisher.port';
export declare class BillingEventPublisher implements IEventPublisher {
    private readonly logger;
    private readonly exchange;
    private readonly url;
    private readonly connection;
    publishPaymentResult(event: PaymentResultEvent): Promise<void>;
}
