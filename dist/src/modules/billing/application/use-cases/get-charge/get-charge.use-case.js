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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetChargeUseCase = void 0;
const common_1 = require("@nestjs/common");
const charge_repository_1 = require("../../../domain/charge.repository");
const charge_id_vo_1 = require("../../../domain/value-objects/charge-id.vo");
const not_found_exception_1 = require("../../../../../shared/domain/exceptions/not-found.exception");
let GetChargeUseCase = class GetChargeUseCase {
    constructor(charges) {
        this.charges = charges;
    }
    async byId(chargeId) {
        const charge = await this.charges.findById(charge_id_vo_1.ChargeId.fromString(chargeId));
        if (!charge)
            throw new not_found_exception_1.NotFoundException('Charge', chargeId);
        return charge;
    }
    async byServiceOrderId(serviceOrderId) {
        const charge = await this.charges.findByServiceOrderId(serviceOrderId);
        if (!charge)
            throw new not_found_exception_1.NotFoundException('Charge for order', serviceOrderId);
        return charge;
    }
};
exports.GetChargeUseCase = GetChargeUseCase;
exports.GetChargeUseCase = GetChargeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(charge_repository_1.CHARGE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetChargeUseCase);
//# sourceMappingURL=get-charge.use-case.js.map