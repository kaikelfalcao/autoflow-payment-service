const mockPublish = jest.fn();
const mockCreateChannel = jest.fn().mockReturnValue({ publish: mockPublish });

jest.mock("amqp-connection-manager", () => ({
  connect: jest.fn().mockReturnValue({
    createChannel: mockCreateChannel,
    on: jest.fn(),
  }),
}));

import { EventPublisherService } from "./event-publisher.service";

describe("EventPublisherService", () => {
  beforeEach(() => {
    mockPublish.mockReset();
    mockCreateChannel.mockClear();
  });

  it("publish envia evento serializado para exchange + routingKey", async () => {
    mockPublish.mockResolvedValue(undefined);
    const svc = new EventPublisherService();

    await svc.publish({
      exchange: "order.events",
      routingKey: "order.payment.requested",
      event: {
        eventId: "evt-1",
        eventType: "PaymentRequested",
        timestamp: "2026-05-18T00:00:00Z",
        source: "order-service",
        correlationId: "cid-1",
        payload: { orderId: "order-1" },
      },
    });

    expect(mockPublish).toHaveBeenCalled();
    const [exchange, routingKey, body, opts] = mockPublish.mock.calls[0];
    expect(exchange).toBe("order.events");
    expect(routingKey).toBe("order.payment.requested");
    expect(JSON.parse(body.toString()).eventId).toBe("evt-1");
    expect(opts).toEqual({ contentType: "application/json", persistent: true });
  });

  it("swallow falha do publish (não propaga)", async () => {
    mockPublish.mockRejectedValueOnce(new Error("rmq down"));
    const svc = new EventPublisherService();

    await expect(
      svc.publish({
        exchange: "x",
        routingKey: "y",
        event: {
          eventId: "e",
          eventType: "T",
          timestamp: "t",
          source: "s",
          correlationId: "c",
          payload: {},
        },
      }),
    ).resolves.toBeUndefined();
  });
});
