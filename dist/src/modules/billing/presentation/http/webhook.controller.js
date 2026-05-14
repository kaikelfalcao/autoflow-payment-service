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
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const process_webhook_use_case_1 = require("../../application/use-cases/process-webhook/process-webhook.use-case");
const mp_webhook_dto_1 = require("./dtos/mp-webhook.dto");
let WebhookController = WebhookController_1 = class WebhookController {
    constructor(processWebhook) {
        this.processWebhook = processWebhook;
        this.logger = new common_1.Logger(WebhookController_1.name);
    }
    async handleMpWebhook(dto) {
        if (dto.type !== 'payment') {
            this.logger.log(`Ignoring webhook type: ${dto.type}`);
            return;
        }
        this.logger.log(`Received MP webhook: action=${dto.action} paymentId=${dto.data?.id}`);
        await this.processWebhook.execute({
            mpPaymentId: dto.data.id,
            action: dto.action,
            rawPayload: dto,
        });
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('mercadopago'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mp_webhook_dto_1.MpWebhookDto]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleMpWebhook", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, common_1.Controller)('billing/webhook'),
    __metadata("design:paramtypes", [process_webhook_use_case_1.ProcessWebhookUseCase])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map