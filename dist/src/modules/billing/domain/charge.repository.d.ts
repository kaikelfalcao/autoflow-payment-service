import type { Charge } from './charge.entity';
import type { ChargeId } from './value-objects/charge-id.vo';
export declare const CHARGE_REPOSITORY: unique symbol;
export interface IChargeRepository {
    save(charge: Charge): Promise<void>;
    update(charge: Charge): Promise<void>;
    findById(id: ChargeId): Promise<Charge | null>;
    findByServiceOrderId(serviceOrderId: string): Promise<Charge | null>;
}
