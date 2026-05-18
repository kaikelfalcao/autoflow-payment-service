import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from "@nestjs/common";
import { ProcessWebhookUseCase } from "../../application/use-cases/process-webhook/process-webhook.use-case";
import { MpWebhookDto } from "./dtos/mp-webhook.dto";

@Controller("billing/webhook")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly processWebhook: ProcessWebhookUseCase) {}

  // Endpoint chamado pelo Mercado Pago — deve ser público (sem JWT)
  @Post("mercadopago")
  @HttpCode(HttpStatus.OK)
  async handleMpWebhook(@Body() dto: MpWebhookDto): Promise<void> {
    if (dto.type !== "payment") {
      this.logger.log(`Ignoring webhook type: ${dto.type}`);
      return;
    }

    this.logger.log(
      `Received MP webhook: action=${dto.action} paymentId=${dto.data?.id}`,
    );

    await this.processWebhook.execute({
      mpPaymentId: dto.data.id,
      action: dto.action,
      rawPayload: dto as unknown as Record<string, unknown>,
    });
  }
}
