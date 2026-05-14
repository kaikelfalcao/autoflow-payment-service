import { Charge } from '../../domain/charge.entity';
import { ChargeOrmEntity } from './charge.typeorm.entity';
export declare class ChargeMapper {
    static toDomain(orm: ChargeOrmEntity): Charge;
    static toOrm(charge: Charge): ChargeOrmEntity;
}
