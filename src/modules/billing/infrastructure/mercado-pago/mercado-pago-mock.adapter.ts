import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import type {
  IMercadoPagoPort,
  CreatePreferenceInput,
  CreatePreferenceOutput,
  GetPaymentOutput,
} from "../../domain/ports/mercado-pago.port";

@Injectable()
export class MercadoPagoMockAdapter implements IMercadoPagoPort {
  private readonly logger = new Logger(MercadoPagoMockAdapter.name);
  private readonly payments = new Map<
    string,
    { externalReference: string; status: "approved" | "rejected" | "pending" }
  >();

  async createPreference(
    input: CreatePreferenceInput,
  ): Promise<CreatePreferenceOutput> {
    const preferenceId = `mock-pref-${randomUUID()}`;
    const mockPaymentId = `mock-pay-${randomUUID()}`;
    this.payments.set(mockPaymentId, {
      externalReference: input.serviceOrderId,
      status: "pending",
    });
    this.logger.log(
      `[MOCK] Preference ${preferenceId} for order ${input.serviceOrderId} (totalCents=${input.totalCents})`,
    );
    return {
      preferenceId,
      checkoutUrl: `http://localhost:3004/billing/mock/checkout/${mockPaymentId}`,
    };
  }

  async getPayment(mpPaymentId: string): Promise<GetPaymentOutput> {
    const data = this.payments.get(mpPaymentId);
    if (!data) {
      this.logger.warn(`[MOCK] Payment ${mpPaymentId} not found`);
      return {
        mpPaymentId,
        status: "pending",
        externalReference: "",
      };
    }
    return {
      mpPaymentId,
      status: data.status,
      externalReference: data.externalReference,
    };
  }

  setStatus(
    mpPaymentId: string,
    status: "approved" | "rejected" | "pending",
  ): void {
    const data = this.payments.get(mpPaymentId);
    if (data) {
      data.status = status;
      this.logger.log(`[MOCK] Payment ${mpPaymentId} → ${status}`);
    }
  }

  registerExternal(
    mpPaymentId: string,
    externalReference: string,
    status: "approved" | "rejected" | "pending" = "pending",
  ): void {
    this.payments.set(mpPaymentId, { externalReference, status });
  }
}
