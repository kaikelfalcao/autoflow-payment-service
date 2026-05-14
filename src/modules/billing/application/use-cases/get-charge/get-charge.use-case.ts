import { Inject, Injectable } from '@nestjs/common';
import {
  CHARGE_REPOSITORY,
  type IChargeRepository,
} from '../../../domain/charge.repository';
import { ChargeId } from '../../../domain/value-objects/charge-id.vo';
import type { Charge } from '../../../domain/charge.entity';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

@Injectable()
export class GetChargeUseCase {
  constructor(
    @Inject(CHARGE_REPOSITORY)
    private readonly charges: IChargeRepository,
  ) {}

  async byId(chargeId: string): Promise<Charge> {
    const charge = await this.charges.findById(ChargeId.fromString(chargeId));
    if (!charge) throw new NotFoundException('Charge', chargeId);
    return charge;
  }

  async byServiceOrderId(serviceOrderId: string): Promise<Charge> {
    const charge = await this.charges.findByServiceOrderId(serviceOrderId);
    if (!charge) throw new NotFoundException('Charge for order', serviceOrderId);
    return charge;
  }
}
