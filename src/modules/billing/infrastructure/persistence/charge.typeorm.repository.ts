import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IChargeRepository } from '../../domain/charge.repository';
import type { Charge } from '../../domain/charge.entity';
import type { ChargeId } from '../../domain/value-objects/charge-id.vo';
import { ChargeOrmEntity } from './charge.typeorm.entity';
import { ChargeMapper } from './charge.mapper';

@Injectable()
export class ChargeTypeOrmRepository implements IChargeRepository {
  constructor(
    @InjectRepository(ChargeOrmEntity)
    private readonly repo: Repository<ChargeOrmEntity>,
  ) {}

  async save(charge: Charge): Promise<void> {
    await this.repo.save(ChargeMapper.toOrm(charge));
  }

  async update(charge: Charge): Promise<void> {
    await this.repo.save(ChargeMapper.toOrm(charge));
  }

  async findById(id: ChargeId): Promise<Charge | null> {
    const orm = await this.repo.findOneBy({ id: id.value });
    return orm ? ChargeMapper.toDomain(orm) : null;
  }

  async findByServiceOrderId(serviceOrderId: string): Promise<Charge | null> {
    const orm = await this.repo.findOneBy({ serviceOrderId });
    return orm ? ChargeMapper.toDomain(orm) : null;
  }
}
