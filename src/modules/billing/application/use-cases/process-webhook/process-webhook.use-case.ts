import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CHARGE_REPOSITORY,
  type IChargeRepository,
} from '../../../domain/charge.repository';
import { ChargeId } from '../../../domain/value-objects/charge-id.vo';
import {
  MERCADO_PAGO_PORT,
  type IMercadoPagoPort,
} from '../../../domain/ports/mercado-pago.port';
import {
  EVENT_PUBLISHER_PORT,
  type IEventPublisher,
} from '../../../domain/ports/event-publisher.port';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { RequestContextService } from '@/shared/logger/request-context.service';
import { recordBusinessEvent } from '@/shared/observability/business-events';

export const WEBHOOK_EVENT_REPOSITORY = Symbol('WEBHOOK_EVENT_REPOSITORY');

export interface IWebhookEventRepository {
  save(event: {
    chargeId: string;
    serviceOrderId: string;
    mpPaymentId: string;
    action: string;
    status: string;
    rawPayload: Record<string, unknown>;
  }): Promise<void>;
}

export interface ProcessWebhookInput {
  mpPaymentId: string;
  action: string;
  rawPayload: Record<string, unknown>;
}

@Injectable()
export class ProcessWebhookUseCase {
  private readonly logger = new Logger(ProcessWebhookUseCase.name);

  constructor(
    @Inject(CHARGE_REPOSITORY)
    private readonly charges: IChargeRepository,
    @Inject(MERCADO_PAGO_PORT)
    private readonly mercadoPago: IMercadoPagoPort,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly publisher: IEventPublisher,
    @Inject(WEBHOOK_EVENT_REPOSITORY)
    private readonly webhookEvents: IWebhookEventRepository,
    private readonly requestCtx: RequestContextService,
  ) {}

  async execute(input: ProcessWebhookInput): Promise<void> {
    this.requestCtx.set('mp_payment_id', input.mpPaymentId);
    this.requestCtx.set('webhook_action', input.action);
    const payment = await this.mercadoPago.getPayment(input.mpPaymentId);
    this.requestCtx.set('mp_status', payment.status);
    this.requestCtx.set('order_id', payment.externalReference);
    const charge = await this.charges.findByServiceOrderId(payment.externalReference);

    if (!charge) {
      this.logger.warn(
        `No charge found for order ${payment.externalReference} (payment ${input.mpPaymentId})`,
      );
      throw new NotFoundException('Charge', payment.externalReference);
    }

    this.requestCtx.set('charge_id', charge.id.value);
    this.requestCtx.set('total_cents', charge.totalCents);

    await this.webhookEvents.save({
      chargeId: charge.id.value,
      serviceOrderId: charge.serviceOrderId,
      mpPaymentId: input.mpPaymentId,
      action: input.action,
      status: payment.status,
      rawPayload: input.rawPayload,
    });

    if (payment.status === 'approved') {
      if (charge.status !== 'PENDING') {
        this.logger.log(`Charge ${charge.id.value} already processed (${charge.status}), skipping approve`);
        return;
      }
      charge.approve(input.mpPaymentId);
      await this.charges.update(charge);
      await this.publisher.publishPaymentResult({
        type: 'payment.approved',
        serviceOrderId: charge.serviceOrderId,
        chargeId: charge.id.value,
        mpPaymentId: input.mpPaymentId,
      });
      this.logger.log(`Payment approved for order ${charge.serviceOrderId}`);
      recordBusinessEvent('PaymentApproved', {
        chargeId: charge.id.value,
        orderId: charge.serviceOrderId,
        mpPaymentId: input.mpPaymentId,
        totalCents: charge.totalCents,
      });
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      if (charge.status !== 'PENDING') {
        this.logger.log(`Charge ${charge.id.value} already processed (${charge.status}), skipping reject`);
        return;
      }
      charge.reject(input.mpPaymentId);
      await this.charges.update(charge);
      await this.publisher.publishPaymentResult({
        type: 'payment.rejected',
        serviceOrderId: charge.serviceOrderId,
        chargeId: charge.id.value,
        mpPaymentId: input.mpPaymentId,
        reason: payment.status,
      });
      this.logger.log(`Payment rejected for order ${charge.serviceOrderId}`);
      recordBusinessEvent('PaymentRejected', {
        chargeId: charge.id.value,
        orderId: charge.serviceOrderId,
        mpPaymentId: input.mpPaymentId,
        totalCents: charge.totalCents,
        reason: payment.status,
      });
    } else if (payment.status === 'refunded') {
      if (charge.status !== 'APPROVED') {
        this.logger.log(`Charge ${charge.id.value} is not APPROVED (${charge.status}), skipping refund`);
        return;
      }
      charge.refund();
      await this.charges.update(charge);
      await this.publisher.publishPaymentResult({
        type: 'payment.refunded',
        serviceOrderId: charge.serviceOrderId,
        chargeId: charge.id.value,
        mpPaymentId: input.mpPaymentId,
        reason: 'refunded',
      });
      this.logger.log(`Payment refunded for order ${charge.serviceOrderId}`);
    } else {
      this.logger.log(
        `Payment ${input.mpPaymentId} still in status ${payment.status}, no action taken`,
      );
    }
  }
}
