import { type IChargeRepository } from '../../../domain/charge.repository';
import { type IMercadoPagoPort } from '../../../domain/ports/mercado-pago.port';
import { type IEventPublisher } from '../../../domain/ports/event-publisher.port';
export declare const WEBHOOK_EVENT_REPOSITORY: unique symbol;
export interface IWebhookEventRepository {
    save(event: {
        chargeId: string;
        serviceOrderId: string;
        mpPaymentId: string;
        action: string;
        status: string;
        rawPayload: Record<string, unknown>;
    }): Promise<void>;
}
export interface ProcessWebhookInput {
    mpPaymentId: string;
    action: string;
    rawPayload: Record<string, unknown>;
}
export declare class ProcessWebhookUseCase {
    private readonly charges;
    private readonly mercadoPago;
    private readonly publisher;
    private readonly webhookEvents;
    private readonly logger;
    constructor(charges: IChargeRepository, mercadoPago: IMercadoPagoPort, publisher: IEventPublisher, webhookEvents: IWebhookEventRepository);
    execute(input: ProcessWebhookInput): Promise<void>;
}
