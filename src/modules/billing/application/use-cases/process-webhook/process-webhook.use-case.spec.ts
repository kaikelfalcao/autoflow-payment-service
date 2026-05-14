import { ProcessWebhookUseCase } from './process-webhook.use-case';
import type { IChargeRepository } from '../../../domain/charge.repository';
import type { IMercadoPagoPort } from '../../../domain/ports/mercado-pago.port';
import type { IEventPublisher } from '../../../domain/ports/event-publisher.port';
import { Charge } from '../../../domain/charge.entity';
import { ChargeId } from '../../../domain/value-objects/charge-id.vo';
import type { IWebhookEventRepository } from './process-webhook.use-case';

const pendingCharge = () =>
  Charge.restore({
    id: ChargeId.fromString('charge-1'),
    serviceOrderId: 'order-1',
    customerId: 'cust-1',
    totalCents: 10000,
    status: 'PENDING',
    mpPreferenceId: 'pref-1',
    mpPaymentId: null,
    checkoutUrl: 'https://mp.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const mockRepo = (): jest.Mocked<IChargeRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByServiceOrderId: jest.fn(),
});

const mockMp = (): jest.Mocked<IMercadoPagoPort> => ({
  createPreference: jest.fn(),
  getPayment: jest.fn(),
});

const mockPublisher = (): jest.Mocked<IEventPublisher> => ({
  publishPaymentResult: jest.fn(),
});

const mockWebhookRepo = (): jest.Mocked<IWebhookEventRepository> => ({
  save: jest.fn(),
});

describe('ProcessWebhookUseCase', () => {
  let useCase: ProcessWebhookUseCase;
  let repo: jest.Mocked<IChargeRepository>;
  let mp: jest.Mocked<IMercadoPagoPort>;
  let publisher: jest.Mocked<IEventPublisher>;
  let webhookRepo: jest.Mocked<IWebhookEventRepository>;

  const input = {
    mpPaymentId: 'pay-123',
    action: 'payment.updated',
    rawPayload: { data: { id: 'pay-123' } },
  };

  beforeEach(() => {
    repo = mockRepo();
    mp = mockMp();
    publisher = mockPublisher();
    webhookRepo = mockWebhookRepo();
    useCase = new ProcessWebhookUseCase(repo, mp, publisher, webhookRepo);
  });

  it('approves charge and publishes event when payment is approved', async () => {
    repo.findByServiceOrderId.mockResolvedValue(pendingCharge());
    mp.getPayment.mockResolvedValue({
      mpPaymentId: 'pay-123',
      status: 'approved',
      externalReference: 'order-1',
    });

    await useCase.execute(input);

    expect(repo.update).toHaveBeenCalled();
    expect(publisher.publishPaymentResult).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'payment.approved', serviceOrderId: 'order-1' }),
    );
    expect(webhookRepo.save).toHaveBeenCalled();
  });

  it('rejects charge and publishes event when payment is rejected', async () => {
    repo.findByServiceOrderId.mockResolvedValue(pendingCharge());
    mp.getPayment.mockResolvedValue({
      mpPaymentId: 'pay-123',
      status: 'rejected',
      externalReference: 'order-1',
    });

    await useCase.execute(input);

    expect(repo.update).toHaveBeenCalled();
    expect(publisher.publishPaymentResult).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'payment.rejected' }),
    );
  });

  it('is idempotent — skips already-processed charge', async () => {
    const approved = Charge.restore({
      id: ChargeId.fromString('charge-1'),
      serviceOrderId: 'order-1',
      customerId: 'cust-1',
      totalCents: 10000,
      status: 'APPROVED',
      mpPreferenceId: 'pref-1',
      mpPaymentId: 'pay-123',
      checkoutUrl: 'https://mp.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repo.findByServiceOrderId.mockResolvedValue(approved);
    mp.getPayment.mockResolvedValue({
      mpPaymentId: 'pay-123',
      status: 'approved',
      externalReference: 'order-1',
    });

    await useCase.execute(input);

    expect(repo.update).not.toHaveBeenCalled();
    expect(publisher.publishPaymentResult).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when no charge found', async () => {
    repo.findByServiceOrderId.mockResolvedValue(null);
    mp.getPayment.mockResolvedValue({
      mpPaymentId: 'pay-999',
      status: 'approved',
      externalReference: 'order-999',
    });

    const { NotFoundException } = await import(
      '@/shared/domain/exceptions/not-found.exception'
    );
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
  });

  it('takes no action for pending MP status', async () => {
    repo.findByServiceOrderId.mockResolvedValue(pendingCharge());
    mp.getPayment.mockResolvedValue({
      mpPaymentId: 'pay-123',
      status: 'pending',
      externalReference: 'order-1',
    });

    await useCase.execute(input);

    expect(repo.update).not.toHaveBeenCalled();
    expect(publisher.publishPaymentResult).not.toHaveBeenCalled();
  });
});
