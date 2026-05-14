import { Inject, Injectable, Logger } from '@nestjs/common';
import { Charge } from '../../../domain/charge.entity';
import { ChargeId } from '../../../domain/value-objects/charge-id.vo';
import {
  CHARGE_REPOSITORY,
  type IChargeRepository,
} from '../../../domain/charge.repository';
import {
  MERCADO_PAGO_PORT,
  type IMercadoPagoPort,
} from '../../../domain/ports/mercado-pago.port';

export interface CreateChargeInput {
  serviceOrderId: string;
  customerId: string;
  totalCents: number;
}

export interface CreateChargeOutput {
  chargeId: string;
  checkoutUrl: string;
}

@Injectable()
export class CreateChargeUseCase {
  private readonly logger = new Logger(CreateChargeUseCase.name);

  constructor(
    @Inject(CHARGE_REPOSITORY)
    private readonly charges: IChargeRepository,
    @Inject(MERCADO_PAGO_PORT)
    private readonly mercadoPago: IMercadoPagoPort,
  ) {}

  async execute(input: CreateChargeInput): Promise<CreateChargeOutput> {
    const existing = await this.charges.findByServiceOrderId(input.serviceOrderId);
    if (existing) {
      this.logger.warn(`Charge already exists for order ${input.serviceOrderId}`);
      return { chargeId: existing.id.value, checkoutUrl: existing.checkoutUrl ?? '' };
    }

    const charge = Charge.create({
      id: ChargeId.generate(),
      serviceOrderId: input.serviceOrderId,
      customerId: input.customerId,
      totalCents: input.totalCents,
    });

    const preference = await this.mercadoPago.createPreference({
      chargeId: charge.id.value,
      serviceOrderId: input.serviceOrderId,
      totalCents: input.totalCents,
    });

    charge.attachPreference(preference.preferenceId, preference.checkoutUrl);
    await this.charges.save(charge);

    this.logger.log(
      `Charge ${charge.id.value} created for order ${input.serviceOrderId}`,
    );

    return { chargeId: charge.id.value, checkoutUrl: preference.checkoutUrl };
  }
}
