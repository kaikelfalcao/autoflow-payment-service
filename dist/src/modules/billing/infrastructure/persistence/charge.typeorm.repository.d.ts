import { Repository } from 'typeorm';
import type { IChargeRepository } from '../../domain/charge.repository';
import type { Charge } from '../../domain/charge.entity';
import type { ChargeId } from '../../domain/value-objects/charge-id.vo';
import { ChargeOrmEntity } from './charge.typeorm.entity';
export declare class ChargeTypeOrmRepository implements IChargeRepository {
    private readonly repo;
    constructor(repo: Repository<ChargeOrmEntity>);
    save(charge: Charge): Promise<void>;
    update(charge: Charge): Promise<void>;
    findById(id: ChargeId): Promise<Charge | null>;
    findByServiceOrderId(serviceOrderId: string): Promise<Charge | null>;
}
