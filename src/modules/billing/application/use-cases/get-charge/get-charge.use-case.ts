import { Inject, Injectable } from '@nestjs/common';
import {
  CHARGE_REPOSITORY,
  type IChargeRepository,
} from '../../../domain/charge.repository';
import { ChargeId } from '../../../domain/value-objects/charge-id.vo';
import type { Charge } from '../../../domain/charge.entity';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { RequestContextService } from '@/shared/logger/request-context.service';

@Injectable()
export class GetChargeUseCase {
  constructor(
    @Inject(CHARGE_REPOSITORY)
    private readonly charges: IChargeRepository,
    private readonly requestCtx: RequestContextService,
  ) {}

  async byId(chargeId: string): Promise<Charge> {
    this.requestCtx.set('charge_id', chargeId);
    const charge = await this.charges.findById(ChargeId.fromString(chargeId));
    if (!charge) throw new NotFoundException('Charge', chargeId);
    this.enrich(charge);
    return charge;
  }

  async byServiceOrderId(serviceOrderId: string): Promise<Charge> {
    this.requestCtx.set('order_id', serviceOrderId);
    const charge = await this.charges.findByServiceOrderId(serviceOrderId);
    if (!charge) throw new NotFoundException('Charge for order', serviceOrderId);
    this.enrich(charge);
    return charge;
  }

  private enrich(charge: Charge): void {
    this.requestCtx.set('charge_id', charge.id.value);
    this.requestCtx.set('charge_status', charge.status);
    this.requestCtx.set('total_cents', charge.totalCents);
  }
}
