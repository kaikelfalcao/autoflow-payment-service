import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Charge } from '../../src/modules/billing/domain/charge.entity';
import { ChargeId } from '../../src/modules/billing/domain/value-objects/charge-id.vo';
import type { IChargeRepository } from '../../src/modules/billing/domain/charge.repository';
import type { IMercadoPagoPort } from '../../src/modules/billing/domain/ports/mercado-pago.port';
import type { IEventPublisher, PaymentResultEvent } from '../../src/modules/billing/domain/ports/event-publisher.port';
import type { IWebhookEventRepository } from '../../src/modules/billing/application/use-cases/process-webhook/process-webhook.use-case';
import { CreateChargeUseCase } from '../../src/modules/billing/application/use-cases/create-charge/create-charge.use-case';
import { ProcessWebhookUseCase } from '../../src/modules/billing/application/use-cases/process-webhook/process-webhook.use-case';

// ── In-memory repository para BDD ────────────────────────────────────────────

class InMemoryChargeRepository implements IChargeRepository {
  private store = new Map<string, Charge>();

  async save(charge: Charge): Promise<void> {
    this.store.set(charge.id.value, charge);
  }

  async update(charge: Charge): Promise<void> {
    this.store.set(charge.id.value, charge);
  }

  async findById(id: ChargeId): Promise<Charge | null> {
    return this.store.get(id.value) ?? null;
  }

  async findByServiceOrderId(serviceOrderId: string): Promise<Charge | null> {
    for (const charge of this.store.values()) {
      if (charge.serviceOrderId === serviceOrderId) return charge;
    }
    return null;
  }

  count(): number {
    return this.store.size;
  }

  countByServiceOrderId(serviceOrderId: string): number {
    let count = 0;
    for (const c of this.store.values()) {
      if (c.serviceOrderId === serviceOrderId) count++;
    }
    return count;
  }
}

// ── MP mock ───────────────────────────────────────────────────────────────────

class FakeMercadoPago implements IMercadoPagoPort {
  nextPreferenceId = 'pref-test-01';
  nextStatus: IMercadoPagoPort extends { getPayment(id: string): Promise<infer R> } ? R['status'] : string = 'approved';
  private paymentStatus: Record<string, string> = {};

  setPaymentStatus(mpPaymentId: string, status: string): void {
    this.paymentStatus[mpPaymentId] = status;
  }

  async createPreference(input: Parameters<IMercadoPagoPort['createPreference']>[0]) {
    return {
      preferenceId: this.nextPreferenceId,
      checkoutUrl: `https://sandbox.mercadopago.com/checkout/${this.nextPreferenceId}`,
    };
  }

  async getPayment(mpPaymentId: string) {
    return {
      mpPaymentId,
      status: (this.paymentStatus[mpPaymentId] ?? 'pending') as any,
      externalReference: this._lastServiceOrderId,
    };
  }

  _lastServiceOrderId = '';
}

// ── Event publisher spy ───────────────────────────────────────────────────────

class SpyEventPublisher implements IEventPublisher {
  published: PaymentResultEvent[] = [];

  async publishPaymentResult(event: PaymentResultEvent): Promise<void> {
    this.published.push(event);
  }
}

// ── Webhook event repo stub ───────────────────────────────────────────────────

class NoOpWebhookRepo implements IWebhookEventRepository {
  async save() {}
}

// ── World ─────────────────────────────────────────────────────────────────────

export class BillingWorld extends World {
  repo = new InMemoryChargeRepository();
  mp = new FakeMercadoPago();
  publisher = new SpyEventPublisher();
  webhookRepo = new NoOpWebhookRepo();

  createChargeUseCase = new CreateChargeUseCase(this.repo, this.mp);
  processWebhookUseCase = new ProcessWebhookUseCase(
    this.repo,
    this.mp,
    this.publisher,
    this.webhookRepo,
  );

  // state between steps
  currentServiceOrderId = '';
  currentCustomerId = '';
  currentTotalCents = 0;
  currentCharge: Charge | null = null;
}

setWorldConstructor(BillingWorld);
