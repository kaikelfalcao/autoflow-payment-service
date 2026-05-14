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
exports.ChargeController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const get_charge_use_case_1 = require("../../application/use-cases/get-charge/get-charge.use-case");
const charge_response_dto_1 = require("./dtos/charge-response.dto");
let ChargeController = class ChargeController {
    constructor(getCharge) {
        this.getCharge = getCharge;
    }
    async getById(chargeId) {
        const charge = await this.getCharge.byId(chargeId);
        return charge_response_dto_1.ChargeResponseDto.fromDomain(charge);
    }
    async getByOrder(serviceOrderId) {
        const charge = await this.getCharge.byServiceOrderId(serviceOrderId);
        return charge_response_dto_1.ChargeResponseDto.fromDomain(charge);
    }
};
exports.ChargeController = ChargeController;
__decorate([
    (0, common_1.Get)(':chargeId'),
    openapi.ApiResponse({ status: 200, type: require("./dtos/charge-response.dto").ChargeResponseDto }),
    __param(0, (0, common_1.Param)('chargeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChargeController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)('order/:serviceOrderId'),
    openapi.ApiResponse({ status: 200, type: require("./dtos/charge-response.dto").ChargeResponseDto }),
    __param(0, (0, common_1.Param)('serviceOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChargeController.prototype, "getByOrder", null);
exports.ChargeController = ChargeController = __decorate([
    (0, common_1.Controller)('billing/charges'),
    __metadata("design:paramtypes", [get_charge_use_case_1.GetChargeUseCase])
], ChargeController);
//# sourceMappingURL=charge.controller.js.map