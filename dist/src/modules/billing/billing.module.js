"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const charge_repository_1 = require("./domain/charge.repository");
const mercado_pago_port_1 = require("./domain/ports/mercado-pago.port");
const event_publisher_port_1 = require("./domain/ports/event-publisher.port");
const create_charge_use_case_1 = require("./application/use-cases/create-charge/create-charge.use-case");
const process_webhook_use_case_1 = require("./application/use-cases/process-webhook/process-webhook.use-case");
const get_charge_use_case_1 = require("./application/use-cases/get-charge/get-charge.use-case");
const charge_typeorm_entity_1 = require("./infrastructure/persistence/charge.typeorm.entity");
const charge_typeorm_repository_1 = require("./infrastructure/persistence/charge.typeorm.repository");
const webhook_event_typeorm_entity_1 = require("./infrastructure/persistence/webhook-event.typeorm.entity");
const webhook_event_typeorm_repository_1 = require("./infrastructure/persistence/webhook-event.typeorm.repository");
const mercado_pago_adapter_1 = require("./infrastructure/mercado-pago/mercado-pago.adapter");
const billing_event_publisher_1 = require("./infrastructure/messaging/billing-event-publisher");
const payment_requested_consumer_1 = require("./infrastructure/messaging/payment-requested-consumer");
const webhook_controller_1 = require("./presentation/http/webhook.controller");
const charge_controller_1 = require("./presentation/http/charge.controller");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([charge_typeorm_entity_1.ChargeOrmEntity, webhook_event_typeorm_entity_1.WebhookEventOrmEntity]),
        ],
        controllers: [webhook_controller_1.WebhookController, charge_controller_1.ChargeController],
        providers: [
            { provide: charge_repository_1.CHARGE_REPOSITORY, useClass: charge_typeorm_repository_1.ChargeTypeOrmRepository },
            { provide: mercado_pago_port_1.MERCADO_PAGO_PORT, useClass: mercado_pago_adapter_1.MercadoPagoAdapter },
            { provide: event_publisher_port_1.EVENT_PUBLISHER_PORT, useClass: billing_event_publisher_1.BillingEventPublisher },
            { provide: process_webhook_use_case_1.WEBHOOK_EVENT_REPOSITORY, useClass: webhook_event_typeorm_repository_1.WebhookEventTypeOrmRepository },
            create_charge_use_case_1.CreateChargeUseCase,
            process_webhook_use_case_1.ProcessWebhookUseCase,
            get_charge_use_case_1.GetChargeUseCase,
            payment_requested_consumer_1.PaymentRequestedConsumer,
        ],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map