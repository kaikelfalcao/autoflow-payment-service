import { ProcessWebhookUseCase } from '../../application/use-cases/process-webhook/process-webhook.use-case';
import { MpWebhookDto } from './dtos/mp-webhook.dto';
export declare class WebhookController {
    private readonly processWebhook;
    private readonly logger;
    constructor(processWebhook: ProcessWebhookUseCase);
    handleMpWebhook(dto: MpWebhookDto): Promise<void>;
}
