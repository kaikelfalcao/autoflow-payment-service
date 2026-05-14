import { type IChargeRepository } from '../../../domain/charge.repository';
import { type IMercadoPagoPort } from '../../../domain/ports/mercado-pago.port';
export interface CreateChargeInput {
    serviceOrderId: string;
    customerId: string;
    totalCents: number;
}
export interface CreateChargeOutput {
    chargeId: string;
    checkoutUrl: string;
}
export declare class CreateChargeUseCase {
    private readonly charges;
    private readonly mercadoPago;
    private readonly logger;
    constructor(charges: IChargeRepository, mercadoPago: IMercadoPagoPort);
    execute(input: CreateChargeInput): Promise<CreateChargeOutput>;
}
