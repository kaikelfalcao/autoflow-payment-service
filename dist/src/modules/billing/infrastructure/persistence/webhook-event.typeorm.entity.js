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
exports.WebhookEventOrmEntity = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
let WebhookEventOrmEntity = class WebhookEventOrmEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, chargeId: { required: true, type: () => String }, serviceOrderId: { required: true, type: () => String }, mpPaymentId: { required: true, type: () => String }, action: { required: true, type: () => String }, status: { required: true, type: () => String }, rawPayload: { required: true, type: () => Object }, processedAt: { required: true, type: () => Date } };
    }
};
exports.WebhookEventOrmEntity = WebhookEventOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WebhookEventOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'charge_id', type: 'uuid' }),
    __metadata("design:type", String)
], WebhookEventOrmEntity.prototype, "chargeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_order_id', type: 'uuid' }),
    __metadata("design:type", String)
], WebhookEventOrmEntity.prototype, "serviceOrderId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'mp_payment_id', type: 'varchar' }),
    __metadata("design:type", String)
], WebhookEventOrmEntity.prototype, "mpPaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], WebhookEventOrmEntity.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], WebhookEventOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'raw_payload', type: 'jsonb' }),
    __metadata("design:type", Object)
], WebhookEventOrmEntity.prototype, "rawPayload", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'processed_at' }),
    __metadata("design:type", Date)
], WebhookEventOrmEntity.prototype, "processedAt", void 0);
exports.WebhookEventOrmEntity = WebhookEventOrmEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'webhook_events' })
], WebhookEventOrmEntity);
//# sourceMappingURL=webhook-event.typeorm.entity.js.map