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
var ProcessWebhookUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessWebhookUseCase = exports.WEBHOOK_EVENT_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const charge_repository_1 = require("../../../domain/charge.repository");
const mercado_pago_port_1 = require("../../../domain/ports/mercado-pago.port");
const event_publisher_port_1 = require("../../../domain/ports/event-publisher.port");
const not_found_exception_1 = require("../../../../../shared/domain/exceptions/not-found.exception");
exports.WEBHOOK_EVENT_REPOSITORY = Symbol('WEBHOOK_EVENT_REPOSITORY');
let ProcessWebhookUseCase = ProcessWebhookUseCase_1 = class ProcessWebhookUseCase {
    constructor(charges, mercadoPago, publisher, webhookEvents) {
        this.charges = charges;
        this.mercadoPago = mercadoPago;
        this.publisher = publisher;
        this.webhookEvents = webhookEvents;
        this.logger = new common_1.Logger(ProcessWebhookUseCase_1.name);
    }
    async execute(input) {
        const payment = await this.mercadoPago.getPayment(input.mpPaymentId);
        const charge = await this.charges.findByServiceOrderId(payment.externalReference);
        if (!charge) {
            this.logger.warn(`No charge found for order ${payment.externalReference} (payment ${input.mpPaymentId})`);
            throw new not_found_exception_1.NotFoundException('Charge', payment.externalReference);
        }
        await this.webhookEvents.save({
            chargeId: charge.id.value,
            serviceOrderId: charge.serviceOrderId,
            mpPaymentId: input.mpPaymentId,
            action: input.action,
            status: payment.status,
            rawPayload: input.rawPayload,
        });
        if (payment.status === 'approved') {
            if (charge.status !== 'PENDING') {
                this.logger.log(`Charge ${charge.id.value} already processed (${charge.status}), skipping approve`);
                return;
            }
            charge.approve(input.mpPaymentId);
            await this.charges.update(charge);
            await this.publisher.publishPaymentResult({
                type: 'payment.approved',
                serviceOrderId: charge.serviceOrderId,
                chargeId: charge.id.value,
                mpPaymentId: input.mpPaymentId,
            });
            this.logger.log(`Payment approved for order ${charge.serviceOrderId}`);
        }
        else if (payment.status === 'rejected' || payment.status === 'cancelled') {
            if (charge.status !== 'PENDING') {
                this.logger.log(`Charge ${charge.id.value} already processed (${charge.status}), skipping reject`);
                return;
            }
            charge.reject(input.mpPaymentId);
            await this.charges.update(charge);
            await this.publisher.publishPaymentResult({
                type: 'payment.rejected',
                serviceOrderId: charge.serviceOrderId,
                chargeId: charge.id.value,
                mpPaymentId: input.mpPaymentId,
                reason: payment.status,
            });
            this.logger.log(`Payment rejected for order ${charge.serviceOrderId}`);
        }
        else if (payment.status === 'refunded') {
            if (charge.status !== 'APPROVED') {
                this.logger.log(`Charge ${charge.id.value} is not APPROVED (${charge.status}), skipping refund`);
                return;
            }
            charge.refund();
            await this.charges.update(charge);
            await this.publisher.publishPaymentResult({
                type: 'payment.refunded',
                serviceOrderId: charge.serviceOrderId,
                chargeId: charge.id.value,
                mpPaymentId: input.mpPaymentId,
                reason: 'refunded',
            });
            this.logger.log(`Payment refunded for order ${charge.serviceOrderId}`);
        }
        else {
            this.logger.log(`Payment ${input.mpPaymentId} still in status ${payment.status}, no action taken`);
        }
    }
};
exports.ProcessWebhookUseCase = ProcessWebhookUseCase;
exports.ProcessWebhookUseCase = ProcessWebhookUseCase = ProcessWebhookUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(charge_repository_1.CHARGE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(mercado_pago_port_1.MERCADO_PAGO_PORT)),
    __param(2, (0, common_1.Inject)(event_publisher_port_1.EVENT_PUBLISHER_PORT)),
    __param(3, (0, common_1.Inject)(exports.WEBHOOK_EVENT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ProcessWebhookUseCase);
//# sourceMappingURL=process-webhook.use-case.js.map