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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CreateChargeUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChargeUseCase = void 0;
const common_1 = require("@nestjs/common");
const charge_entity_1 = require("../../../domain/charge.entity");
const charge_id_vo_1 = require("../../../domain/value-objects/charge-id.vo");
const charge_repository_1 = require("../../../domain/charge.repository");
const mercado_pago_port_1 = require("../../../domain/ports/mercado-pago.port");
let CreateChargeUseCase = CreateChargeUseCase_1 = class CreateChargeUseCase {
    constructor(charges, mercadoPago) {
        this.charges = charges;
        this.mercadoPago = mercadoPago;
        this.logger = new common_1.Logger(CreateChargeUseCase_1.name);
    }
    async execute(input) {
        const existing = await this.charges.findByServiceOrderId(input.serviceOrderId);
        if (existing) {
            this.logger.warn(`Charge already exists for order ${input.serviceOrderId}`);
            return { chargeId: existing.id.value, checkoutUrl: existing.checkoutUrl ?? '' };
        }
        const charge = charge_entity_1.Charge.create({
            id: charge_id_vo_1.ChargeId.generate(),
            serviceOrderId: input.serviceOrderId,
            customerId: input.customerId,
            totalCents: input.totalCents,
        });
        const preference = await this.mercadoPago.createPreference({
            chargeId: charge.id.value,
            serviceOrderId: input.serviceOrderId,
            totalCents: input.totalCents,
        });
        charge.attachPreference(preference.preferenceId, preference.checkoutUrl);
        await this.charges.save(charge);
        this.logger.log(`Charge ${charge.id.value} created for order ${input.serviceOrderId}`);
        return { chargeId: charge.id.value, checkoutUrl: preference.checkoutUrl };
    }
};
exports.CreateChargeUseCase = CreateChargeUseCase;
exports.CreateChargeUseCase = CreateChargeUseCase = CreateChargeUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(charge_repository_1.CHARGE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(mercado_pago_port_1.MERCADO_PAGO_PORT)),
    __metadata("design:paramtypes", [Object, Object])
], CreateChargeUseCase);
//# sourceMappingURL=create-charge.use-case.js.map