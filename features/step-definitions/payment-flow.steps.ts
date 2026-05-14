import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import type { BillingWorld } from '../support/world';

Given('o Billing Service está operacional', function (this: BillingWorld) {
  assert.ok(this.createChargeUseCase, 'CreateChargeUseCase should be available');
});

Given(
  'um evento {string} é recebido para a ordem {string}',
  function (this: BillingWorld, _type: string, orderId: string) {
    this.currentServiceOrderId = orderId;
    this.mp._lastServiceOrderId = orderId;
  },
);

Given('o valor total é {int} centavos', function (this: BillingWorld, cents: number) {
  this.currentTotalCents = cents;
});

Given('o cliente possui id {string}', function (this: BillingWorld, customerId: string) {
  this.currentCustomerId = customerId;
});

When('o Billing Service processa o evento de orçamento', async function (this: BillingWorld) {
  await this.createChargeUseCase.execute({
    serviceOrderId: this.currentServiceOrderId,
    customerId: this.currentCustomerId,
    totalCents: this.currentTotalCents,
  });
  this.currentCharge = await this.repo.findByServiceOrderId(this.currentServiceOrderId);
});

When(
  'o Billing Service processa o mesmo evento novamente',
  async function (this: BillingWorld) {
    await this.createChargeUseCase.execute({
      serviceOrderId: this.currentServiceOrderId,
      customerId: this.currentCustomerId,
      totalCents: this.currentTotalCents,
    });
  },
);

Then(
  'uma cobrança é criada com status {string}',
  function (this: BillingWorld, status: string) {
    assert.ok(this.currentCharge, 'Charge should exist');
    assert.strictEqual(this.currentCharge.status, status);
  },
);

Then(
  'uma preferência Mercado Pago é gerada com id {string}',
  function (this: BillingWorld, prefId: string) {
    assert.ok(this.currentCharge, 'Charge should exist');
    assert.strictEqual(this.currentCharge.mpPreferenceId, prefId);
  },
);

Then('a cobrança possui um checkout URL válido', function (this: BillingWorld) {
  assert.ok(this.currentCharge?.checkoutUrl, 'Checkout URL should be set');
  assert.ok(
    this.currentCharge.checkoutUrl!.startsWith('https://'),
    'Checkout URL should be HTTPS',
  );
});

When(
  'um webhook do Mercado Pago é recebido com status {string} para o pagamento {string}',
  async function (this: BillingWorld, mpStatus: string, mpPaymentId: string) {
    this.mp.setPaymentStatus(mpPaymentId, mpStatus);
    await this.processWebhookUseCase.execute({
      mpPaymentId,
      action: 'payment.updated',
      rawPayload: { data: { id: mpPaymentId } },
    });
    this.currentCharge = await this.repo.findByServiceOrderId(this.currentServiceOrderId);
  },
);

Then(
  'a cobrança é atualizada para o status {string}',
  function (this: BillingWorld, status: string) {
    assert.ok(this.currentCharge, 'Charge should exist');
    assert.strictEqual(this.currentCharge.status, status);
  },
);

Then(
  'um evento {string} é publicado para a ordem {string}',
  function (this: BillingWorld, eventType: string, orderId: string) {
    const event = this.publisher.published.find(
      (e) => e.type === eventType && e.serviceOrderId === orderId,
    );
    assert.ok(event, `Event "${eventType}" for order "${orderId}" should have been published`);
  },
);

Then(
  'apenas uma cobrança existe para a ordem {string}',
  function (this: BillingWorld, orderId: string) {
    const count = this.repo.countByServiceOrderId(orderId);
    assert.strictEqual(count, 1, 'There should be exactly one charge per order');
  },
);
