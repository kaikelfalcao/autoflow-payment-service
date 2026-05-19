import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { IWebhookEventRepository } from "../../application/use-cases/process-webhook/process-webhook.use-case";
import { WebhookEventOrmEntity } from "./webhook-event.typeorm.entity";

@Injectable()
export class WebhookEventTypeOrmRepository implements IWebhookEventRepository {
  constructor(
    @InjectRepository(WebhookEventOrmEntity)
    private readonly repo: Repository<WebhookEventOrmEntity>,
  ) {}

  async save(event: {
    chargeId: string;
    serviceOrderId: string;
    mpPaymentId: string;
    action: string;
    status: string;
    rawPayload: Record<string, unknown>;
  }): Promise<void> {
    await this.repo.save(event);
  }
}
