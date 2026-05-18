import { WebhookEventTypeOrmRepository } from "./webhook-event.typeorm.repository";

describe("WebhookEventTypeOrmRepository", () => {
  it("save delega para repo.save", async () => {
    const inner = { save: jest.fn(async () => undefined) };
    const repo = new WebhookEventTypeOrmRepository(inner as never);

    await repo.save({
      chargeId: "ch_1",
      serviceOrderId: "order_1",
      mpPaymentId: "pay_1",
      action: "payment.updated",
      status: "approved",
      rawPayload: { foo: "bar" },
    });

    expect(inner.save).toHaveBeenCalledWith({
      chargeId: "ch_1",
      serviceOrderId: "order_1",
      mpPaymentId: "pay_1",
      action: "payment.updated",
      status: "approved",
      rawPayload: { foo: "bar" },
    });
  });
});
