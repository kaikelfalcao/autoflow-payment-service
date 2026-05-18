import { GetChargeUseCase } from './get-charge.use-case';
import type { IChargeRepository } from '../../../domain/charge.repository';
import { Charge } from '../../../domain/charge.entity';
import { ChargeId } from '../../../domain/value-objects/charge-id.vo';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { RequestContextService } from '@/shared/logger/request-context.service';

const mockRequestCtx = () =>
  ({ set: jest.fn(), get: jest.fn(), snapshot: jest.fn() }) as unknown as RequestContextService;

const fakeCharge = () =>
  Charge.restore({
    id: ChargeId.fromString('charge-1'),
    serviceOrderId: 'order-1',
    customerId: 'cust-1',
    totalCents: 10000,
    status: 'PENDING',
    mpPreferenceId: null,
    mpPaymentId: null,
    checkoutUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const mockRepo = (): jest.Mocked<IChargeRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByServiceOrderId: jest.fn(),
});

describe('GetChargeUseCase', () => {
  let useCase: GetChargeUseCase;
  let repo: jest.Mocked<IChargeRepository>;

  beforeEach(() => {
    repo = mockRepo();
    useCase = new GetChargeUseCase(repo, mockRequestCtx());
  });

  describe('byId', () => {
    it('returns charge when found', async () => {
      repo.findById.mockResolvedValue(fakeCharge());
      const result = await useCase.byId('charge-1');
      expect(result.id.value).toBe('charge-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.byId('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('byServiceOrderId', () => {
    it('returns charge when found', async () => {
      repo.findByServiceOrderId.mockResolvedValue(fakeCharge());
      const result = await useCase.byServiceOrderId('order-1');
      expect(result.serviceOrderId).toBe('order-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findByServiceOrderId.mockResolvedValue(null);
      await expect(useCase.byServiceOrderId('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
