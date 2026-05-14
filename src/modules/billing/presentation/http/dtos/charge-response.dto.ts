import type { Charge } from '../../../domain/charge.entity';

export class ChargeResponseDto {
  chargeId: string;
  serviceOrderId: string;
  customerId: string;
  totalCents: number;
  status: string;
  checkoutUrl: string | null;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(charge: Charge): ChargeResponseDto {
    const dto = new ChargeResponseDto();
    dto.chargeId = charge.id.value;
    dto.serviceOrderId = charge.serviceOrderId;
    dto.customerId = charge.customerId;
    dto.totalCents = charge.totalCents;
    dto.status = charge.status;
    dto.checkoutUrl = charge.checkoutUrl;
    dto.mpPreferenceId = charge.mpPreferenceId;
    dto.mpPaymentId = charge.mpPaymentId;
    dto.createdAt = charge.createdAt;
    dto.updatedAt = charge.updatedAt;
    return dto;
  }
}
