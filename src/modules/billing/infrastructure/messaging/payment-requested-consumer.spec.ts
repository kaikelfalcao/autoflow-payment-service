// Mock do amqp-connection-manager — captura o setup callback para invocá-lo manualmente.
const channelHandlers: Record<string, (err: unknown) => void> = {};
let capturedSetup:
  | ((ch: {
      assertExchange: jest.Mock;
      assertQueue: jest.Mock;
      bindQueue: jest.Mock;
      consume: jest.Mock;
      ack: jest.Mock;
      nack: jest.Mock;
    }) => Promise<void>)
  | undefined;

jest.mock("amqp-connection-manager", () => ({
  connect: jest.fn().mockReturnValue({
    createChannel: jest
      .fn()
      .mockImplementation(({ setup }: { setup: typeof capturedSetup }) => {
        capturedSetup = setup;
        return {
          on: (event: string, h: (err: unknown) => void) => {
            channelHandlers[event] = h;
          },
        };
      }),
  }),
}));

import { PaymentRequestedConsumer } from "./payment-requested-consumer";

describe("PaymentRequestedConsumer", () => {
  const makeChannel = () => ({
    assertExchange: jest.fn(async () => undefined),
    assertQueue: jest.fn(async () => undefined),
    bindQueue: jest.fn(async () => undefined),
    consume: jest.fn(async () => undefined),
    ack: jest.fn(),
    nack: jest.fn(),
  });

  beforeEach(() => {
    capturedSetup = undefined;
    Object.keys(channelHandlers).forEach((k) => delete channelHandlers[k]);
  });

  it("declara exchange, queue, binding e consume no onModuleInit", async () => {
    const useCase = { execute: jest.fn(async () => undefined) };
    const consumer = new PaymentRequestedConsumer(useCase as never);
    const ch = makeChannel();

    await consumer.onModuleInit();
    await capturedSetup!(ch);

    expect(ch.assertExchange).toHaveBeenCalledWith("order.events", "topic", {
      durable: true,
    });
    expect(ch.assertQueue).toHaveBeenCalledWith("billing.payment.requested", {
      durable: true,
    });
    expect(ch.bindQueue).toHaveBeenCalledWith(
      "billing.payment.requested",
      "order.events",
      "order.payment.requested",
    );
    expect(ch.consume).toHaveBeenCalled();
  });

  it("processa mensagem válida → invoca CreateChargeUseCase com totalCents", async () => {
    const useCase = { execute: jest.fn(async () => undefined) };
    const consumer = new PaymentRequestedConsumer(useCase as never);
    const ch = makeChannel();

    await consumer.onModuleInit();
    await capturedSetup!(ch);

    const handler = (
      ch.consume.mock.calls[0] as unknown as [
        unknown,
        (msg: unknown) => Promise<void>,
      ]
    )[1];
    const msg = {
      content: Buffer.from(
        JSON.stringify({
          payload: {
            orderId: "order-1",
            customerCpf: "12345678900",
            customerName: "Cli",
            customerEmail: null,
            totalAmount: 99.99,
            items: [],
          },
        }),
      ),
    };

    await handler(msg);

    expect(useCase.execute).toHaveBeenCalledWith({
      serviceOrderId: "order-1",
      customerId: "12345678900",
      totalCents: 9999,
    });
    expect(ch.ack).toHaveBeenCalledWith(msg);
  });

  it("nack(false, false) quando handler falha", async () => {
    const useCase = {
      execute: jest.fn().mockRejectedValue(new Error("boom")),
    };
    const consumer = new PaymentRequestedConsumer(useCase as never);
    const ch = makeChannel();

    await consumer.onModuleInit();
    await capturedSetup!(ch);

    const handler = (
      ch.consume.mock.calls[0] as unknown as [
        unknown,
        (msg: unknown) => Promise<void>,
      ]
    )[1];
    const msg = {
      content: Buffer.from(
        JSON.stringify({
          payload: {
            orderId: "x",
            totalAmount: 1,
            customerCpf: "",
            customerName: "",
            customerEmail: null,
            items: [],
          },
        }),
      ),
    };

    await handler(msg);

    expect(ch.nack).toHaveBeenCalledWith(msg, false, false);
    expect(ch.ack).not.toHaveBeenCalled();
  });

  it("ignora message=null", async () => {
    const useCase = { execute: jest.fn(async () => undefined) };
    const consumer = new PaymentRequestedConsumer(useCase as never);
    const ch = makeChannel();

    await consumer.onModuleInit();
    await capturedSetup!(ch);

    const handler = (
      ch.consume.mock.calls[0] as unknown as [
        unknown,
        (msg: unknown) => Promise<void>,
      ]
    )[1];
    await handler(null);

    expect(useCase.execute).not.toHaveBeenCalled();
    expect(ch.ack).not.toHaveBeenCalled();
    expect(ch.nack).not.toHaveBeenCalled();
  });
});
