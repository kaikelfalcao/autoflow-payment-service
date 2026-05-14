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
var MercadoPagoAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mercadopago_1 = require("mercadopago");
let MercadoPagoAdapter = MercadoPagoAdapter_1 = class MercadoPagoAdapter {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(MercadoPagoAdapter_1.name);
        this.client = new mercadopago_1.MercadoPagoConfig({
            accessToken: config.getOrThrow('MP_ACCESS_TOKEN'),
        });
        this.notificationUrl = config.getOrThrow('MP_NOTIFICATION_URL');
    }
    async createPreference(input) {
        const preference = new mercadopago_1.Preference(this.client);
        const isTest = this.config.get('NODE_ENV') !== 'production';
        const response = await preference.create({
            body: {
                external_reference: input.serviceOrderId,
                notification_url: `${this.notificationUrl}?source_news=webhooks`,
                items: [
                    {
                        id: input.chargeId,
                        title: `Ordem de Serviço #${input.serviceOrderId.slice(0, 8)}`,
                        quantity: 1,
                        unit_price: input.totalCents / 100,
                        currency_id: 'BRL',
                    },
                ],
                back_urls: {
                    success: `${this.notificationUrl.replace('/webhook/mercadopago', '/payment/success')}`,
                    failure: `${this.notificationUrl.replace('/webhook/mercadopago', '/payment/failure')}`,
                    pending: `${this.notificationUrl.replace('/webhook/mercadopago', '/payment/pending')}`,
                },
                auto_return: 'approved',
            },
        });
        const checkoutUrl = isTest
            ? (response.sandbox_init_point ?? response.init_point ?? '')
            : (response.init_point ?? '');
        this.logger.log(`Preference ${response.id} created for order ${input.serviceOrderId}`);
        return {
            preferenceId: response.id ?? '',
            checkoutUrl,
        };
    }
    async getPayment(mpPaymentId) {
        const paymentApi = new mercadopago_1.Payment(this.client);
        const payment = await paymentApi.get({ id: mpPaymentId });
        return {
            mpPaymentId: String(payment.id),
            status: payment.status,
            externalReference: payment.external_reference ?? '',
        };
    }
};
exports.MercadoPagoAdapter = MercadoPagoAdapter;
exports.MercadoPagoAdapter = MercadoPagoAdapter = MercadoPagoAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MercadoPagoAdapter);
//# sourceMappingURL=mercado-pago.adapter.js.map