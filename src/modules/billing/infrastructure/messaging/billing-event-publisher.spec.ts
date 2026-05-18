const mockPublish = jest.fn().mockResolvedValue(undefined);
const mockCreateChannel = jest.fn().mockReturnValue({ publish: mockPublish });

jest.mock("amqp-connection-manager", () => ({
  connect: jest.fn().mockReturnValue({
    createChannel: mockCreateChannel,
    on: jest.fn(),
  }),
}));

import { BillingEventPublisher } from "./billing-event-publisher";

describe("BillingEventPublisher", () => {
  beforeEach(() => {
    mockPublish.mockClear();
    mockCreateChannel.mockClear();
  });

  it("publishPaymentResult monta payload e roteia com payment.confirmed para approved", async () => {
    const pub = new BillingEventPublisher();

    await pub.publishPaymentResult({
      type: "payment.approved",
      serviceOrderId: "order-1",
      chargeId: "ch_1",
    } as never);

    expect(mockPublish).toHaveBeenCalled();
    const [exchange, routingKey, body] = mockPublish.mock.calls[0];
    expect(exchange).toBe("payment.events");
    expect(routingKey).toBe("payment.confirmed");
    expect(JSON.parse(body.toString())).toEqual({ orderId: "order-1" });
  });

  it("inclui reason quando evento é payment.rejected", async () => {
    const pub = new BillingEventPublisher();

    await pub.publishPaymentResult({
      type: "payment.rejected",
      serviceOrderId: "order-2",
      chargeId: "ch_2",
      reason: "insufficient-funds",
    } as never);

    const [, routingKey, body] = mockPublish.mock.calls[0];
    expect(routingKey).toBe("payment.failed");
    expect(JSON.parse(body.toString())).toEqual({
      orderId: "order-2",
      reason: "insufficient-funds",
    });
  });

  it("payment.refunded mapeia para routing key payment.refunded", async () => {
    const pub = new BillingEventPublisher();

    await pub.publishPaymentResult({
      type: "payment.refunded",
      serviceOrderId: "order-3",
      chargeId: "ch_3",
    } as never);

    expect(mockPublish.mock.calls[0][1]).toBe("payment.refunded");
  });

  it("swallow falha do publish sem propagar exceção", async () => {
    mockPublish.mockRejectedValueOnce(new Error("rmq down"));
    const pub = new BillingEventPublisher();

    await expect(
      pub.publishPaymentResult({
        type: "payment.approved",
        serviceOrderId: "order-4",
        chargeId: "ch_4",
      } as never),
    ).resolves.toBeUndefined();
  });
});
