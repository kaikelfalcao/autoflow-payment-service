import { Repository } from 'typeorm';
import type { IWebhookEventRepository } from '../../application/use-cases/process-webhook/process-webhook.use-case';
import { WebhookEventOrmEntity } from './webhook-event.typeorm.entity';
export declare class WebhookEventTypeOrmRepository implements IWebhookEventRepository {
    private readonly repo;
    constructor(repo: Repository<WebhookEventOrmEntity>);
    save(event: {
        chargeId: string;
        serviceOrderId: string;
        mpPaymentId: string;
        action: string;
        status: string;
        rawPayload: Record<string, unknown>;
    }): Promise<void>;
}
