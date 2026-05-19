import { Body, Controller, Logger, Param, Post } from "@nestjs/common";

import { MercadoPagoMockAdapter } from "../../infrastructure/mercado-pago/mercado-pago-mock.adapter";

@Controller("billing/mock")
export class MockPaymentController {
  private readonly logger = new Logger(MockPaymentController.name);

  constructor(private readonly mock: MercadoPagoMockAdapter) {}

  @Post("approve/:mpPaymentId")
  approve(@Param("mpPaymentId") mpPaymentId: string): { status: string } {
    this.mock.setStatus(mpPaymentId, "approved");
    this.logger.log(`Mock: ${mpPaymentId} → approved`);
    return { status: "approved" };
  }

  @Post("reject/:mpPaymentId")
  reject(@Param("mpPaymentId") mpPaymentId: string): { status: string } {
    this.mock.setStatus(mpPaymentId, "rejected");
    this.logger.log(`Mock: ${mpPaymentId} → rejected`);
    return { status: "rejected" };
  }

  @Post("simulate-webhook")
  async simulateWebhook(
    @Body() body: { mpPaymentId: string; status: "approved" | "rejected" },
  ): Promise<{ ok: true }> {
    this.mock.setStatus(body.mpPaymentId, body.status);
    return { ok: true };
  }
}
