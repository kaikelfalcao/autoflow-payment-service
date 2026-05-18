import { Charge } from "../../domain/charge.entity";
import { ChargeId } from "../../domain/value-objects/charge-id.vo";
import { ChargeOrmEntity } from "./charge.typeorm.entity";

export class ChargeMapper {
  static toDomain(orm: ChargeOrmEntity): Charge {
    return Charge.restore({
      id: ChargeId.fromString(orm.id),
      serviceOrderId: orm.serviceOrderId,
      customerId: orm.customerId,
      totalCents: orm.totalCents,
      status: orm.status,
      mpPreferenceId: orm.mpPreferenceId,
      mpPaymentId: orm.mpPaymentId,
      checkoutUrl: orm.checkoutUrl,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(charge: Charge): ChargeOrmEntity {
    const orm = new ChargeOrmEntity();
    orm.id = charge.id.value;
    orm.serviceOrderId = charge.serviceOrderId;
    orm.customerId = charge.customerId;
    orm.totalCents = charge.totalCents;
    orm.status = charge.status;
    orm.mpPreferenceId = charge.mpPreferenceId;
    orm.mpPaymentId = charge.mpPaymentId;
    orm.checkoutUrl = charge.checkoutUrl;
    orm.createdAt = charge.createdAt;
    orm.updatedAt = charge.updatedAt;
    return orm;
  }
}
