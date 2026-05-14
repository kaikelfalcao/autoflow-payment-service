"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargeMapper = void 0;
const charge_entity_1 = require("../../domain/charge.entity");
const charge_id_vo_1 = require("../../domain/value-objects/charge-id.vo");
const charge_typeorm_entity_1 = require("./charge.typeorm.entity");
class ChargeMapper {
    static toDomain(orm) {
        return charge_entity_1.Charge.restore({
            id: charge_id_vo_1.ChargeId.fromString(orm.id),
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
    static toOrm(charge) {
        const orm = new charge_typeorm_entity_1.ChargeOrmEntity();
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
exports.ChargeMapper = ChargeMapper;
//# sourceMappingURL=charge.mapper.js.map