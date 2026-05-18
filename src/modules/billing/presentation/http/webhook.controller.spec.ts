import { WebhookController } from "./webhook.controller";

describe("WebhookController", () => {
  it("ignora webhooks de tipo != payment", async () => {
    const useCase = { execute: jest.fn() };
    const ctrl = new WebhookController(useCase as never);

    await ctrl.handleMpWebhook({
      type: "merchant_order",
      action: "anything",
      data: { id: "1" },
    } as never);

    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it("processa webhook de payment com mpPaymentId, action e rawPayload", async () => {
    const useCase = { execute: jest.fn(async () => undefined) };
    const ctrl = new WebhookController(useCase as never);

    const dto = {
      type: "payment",
      action: "payment.updated",
      data: { id: "pay-123" },
      foo: "bar",
    };

    await ctrl.handleMpWebhook(dto as never);

    expect(useCase.execute).toHaveBeenCalledWith({
      mpPaymentId: "pay-123",
      action: "payment.updated",
      rawPayload: dto,
    });
  });
});
