import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { BaseEvent } from '../../../../infrastructure/messaging/event-publisher.service';
import { CreateChargeUseCase } from '../../application/use-cases/create-charge/create-charge.use-case';

interface PaymentRequestedPayload {
  orderId: string;
  customerCpf: string;
  customerName: string;
  customerEmail: string | null;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

@Injectable()
export class PaymentRequestedConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentRequestedConsumer.name);

  constructor(private readonly createCharge: CreateChargeUseCase) {}

  async onModuleInit(): Promise<void> {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const connection = connect([rabbitUrl]);

    const channel = connection.createChannel({
      setup: async (currentChannel: ConfirmChannel) => {
        await currentChannel.assertExchange('order.events', 'topic', { durable: true });

        await currentChannel.assertQueue('billing.payment.requested', { durable: true });
        await currentChannel.bindQueue(
          'billing.payment.requested',
          'order.events',
          'order.payment.requested',
        );

        await currentChannel.consume(
          'billing.payment.requested',
          async (message: ConsumeMessage | null) => {
            if (!message) return;

            try {
              const event = JSON.parse(message.content.toString()) as BaseEvent<PaymentRequestedPayload>;
              const { payload } = event;

              this.logger.log(`Processing payment.requested for order ${payload.orderId}`);

              await this.createCharge.execute({
                serviceOrderId: payload.orderId,
                customerId: payload.customerCpf,
                totalCents: Math.round(payload.totalAmount * 100),
              });

              currentChannel.ack(message);
            } catch (error) {
              const reason = error instanceof Error ? error.message : 'unknown-error';
              this.logger.warn(`Failed to process payment.requested: ${reason}`);
              currentChannel.nack(message, false, false);
            }
          },
        );
      },
    });

    channel.on('error', (error) => {
      const reason = error instanceof Error ? error.message : 'unknown-error';
      this.logger.warn(`Payment requested consumer channel error: ${reason}`);
    });
  }
}
