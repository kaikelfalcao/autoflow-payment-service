"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargeOrmEntity = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
let ChargeOrmEntity = class ChargeOrmEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, serviceOrderId: { required: true, type: () => String }, customerId: { required: true, type: () => String }, totalCents: { required: true, type: () => Number }, status: { required: true, type: () => Object }, mpPreferenceId: { required: true, type: () => String, nullable: true }, mpPaymentId: { required: true, type: () => String, nullable: true }, checkoutUrl: { required: true, type: () => String, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
};
exports.ChargeOrmEntity = ChargeOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid' }),
    __metadata("design:type", String)
], ChargeOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_order_id', type: 'uuid' }),
    __metadata("design:type", String)
], ChargeOrmEntity.prototype, "serviceOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid' }),
    __metadata("design:type", String)
], ChargeOrmEntity.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_cents', type: 'int' }),
    __metadata("design:type", Number)
], ChargeOrmEntity.prototype, "totalCents", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'REFUNDED'],
        default: 'PENDING',
    }),
    __metadata("design:type", String)
], ChargeOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mp_preference_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ChargeOrmEntity.prototype, "mpPreferenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mp_payment_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ChargeOrmEntity.prototype, "mpPaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'checkout_url', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ChargeOrmEntity.prototype, "checkoutUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ChargeOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ChargeOrmEntity.prototype, "updatedAt", void 0);
exports.ChargeOrmEntity = ChargeOrmEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'charges' })
], ChargeOrmEntity);
//# sourceMappingURL=charge.typeorm.entity.js.map