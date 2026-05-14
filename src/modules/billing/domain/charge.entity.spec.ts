import { Charge } from './charge.entity';
import { ChargeId } from './value-objects/charge-id.vo';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';

const makeCharge = (totalCents = 10000) =>
  Charge.create({
    id: ChargeId.generate(),
    serviceOrderId: 'order-1',
    customerId: 'customer-1',
    totalCents,
  });

describe('Charge', () => {
  describe('create', () => {
    it('starts with PENDING status', () => {
      const charge = makeCharge();
      expect(charge.status).toBe('PENDING');
    });

    it('throws when totalCents is zero', () => {
      expect(() => makeCharge(0)).toThrow(BusinessRuleException);
    });

    it('throws when totalCents is negative', () => {
      expect(() => makeCharge(-1)).toThrow(BusinessRuleException);
    });

    it('initialises MP fields as null', () => {
      const charge = makeCharge();
      expect(charge.mpPreferenceId).toBeNull();
      expect(charge.mpPaymentId).toBeNull();
      expect(charge.checkoutUrl).toBeNull();
    });
  });

  describe('attachPreference', () => {
    it('stores preference ID and checkout URL', () => {
      const charge = makeCharge();
      charge.attachPreference('pref-123', 'https://mp.com/checkout');
      expect(charge.mpPreferenceId).toBe('pref-123');
      expect(charge.checkoutUrl).toBe('https://mp.com/checkout');
    });
  });

  describe('approve', () => {
    it('transitions to APPROVED and stores payment ID', () => {
      const charge = makeCharge();
      charge.approve('pay-abc');
      expect(charge.status).toBe('APPROVED');
      expect(charge.mpPaymentId).toBe('pay-abc');
    });

    it('throws when charge is not PENDING', () => {
      const charge = makeCharge();
      charge.approve('pay-1');
      expect(() => charge.approve('pay-2')).toThrow(BusinessRuleException);
    });
  });

  describe('reject', () => {
    it('transitions to REJECTED and stores payment ID', () => {
      const charge = makeCharge();
      charge.reject('pay-abc');
      expect(charge.status).toBe('REJECTED');
      expect(charge.mpPaymentId).toBe('pay-abc');
    });

    it('throws when charge is not PENDING', () => {
      const charge = makeCharge();
      charge.approve('pay-1');
      expect(() => charge.reject('pay-2')).toThrow(BusinessRuleException);
    });
  });

  describe('expire', () => {
    it('transitions to EXPIRED', () => {
      const charge = makeCharge();
      charge.expire();
      expect(charge.status).toBe('EXPIRED');
    });

    it('throws when charge is not PENDING', () => {
      const charge = makeCharge();
      charge.approve('pay-1');
      expect(() => charge.expire()).toThrow(BusinessRuleException);
    });
  });

  describe('restore', () => {
    it('restores a charge from persisted props', () => {
      const now = new Date();
      const charge = Charge.restore({
        id: ChargeId.fromString('id-1'),
        serviceOrderId: 'order-1',
        customerId: 'cust-1',
        totalCents: 5000,
        status: 'APPROVED',
        mpPreferenceId: 'pref-1',
        mpPaymentId: 'pay-1',
        checkoutUrl: 'https://mp.com',
        createdAt: now,
        updatedAt: now,
      });
      expect(charge.status).toBe('APPROVED');
      expect(charge.totalCents).toBe(5000);
    });
  });
});
