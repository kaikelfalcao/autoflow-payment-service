import { Injectable, Logger } from "@nestjs/common";
import { connect } from "amqp-connection-manager";
import { ConfirmChannel } from "amqplib";
import type {
  IEventPublisher,
  PaymentResultEvent,
} from "../../domain/ports/event-publisher.port";

const ROUTING_KEY: Record<PaymentResultEvent["type"], string> = {
  "payment.approved": "payment.confirmed",
  "payment.rejected": "payment.failed",
  "payment.refunded": "payment.refunded",
};

@Injectable()
export class BillingEventPublisher implements IEventPublisher {
  private readonly logger = new Logger(BillingEventPublisher.name);
  private readonly exchange = "payment.events";
  private readonly url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
  private readonly connection = connect([this.url]);

  async publishPaymentResult(event: PaymentResultEvent): Promise<void> {
    const routingKey = ROUTING_KEY[event.type];

    // Payload flat que o order-service espera: { orderId, reason? }
    const payload: { orderId: string; reason?: string } = {
      orderId: event.serviceOrderId,
      ...("reason" in event ? { reason: event.reason } : {}),
    };

    try {
      const channel = this.connection.createChannel({
        setup: async (currentChannel: ConfirmChannel) => {
          await currentChannel.assertExchange(this.exchange, "topic", {
            durable: true,
          });
        },
      });

      await channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { contentType: "application/json", persistent: true },
      );

      this.logger.log(
        `Published ${routingKey} for order ${event.serviceOrderId}`,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown-error";
      this.logger.warn(`Event publish skipped: ${reason}`);
    }
  }
}
