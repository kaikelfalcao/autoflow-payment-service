import { type IChargeRepository } from '../../../domain/charge.repository';
import type { Charge } from '../../../domain/charge.entity';
export declare class GetChargeUseCase {
    private readonly charges;
    constructor(charges: IChargeRepository);
    byId(chargeId: string): Promise<Charge>;
    byServiceOrderId(serviceOrderId: string): Promise<Charge>;
}
