"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BillingEventPublisher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingEventPublisher = void 0;
const common_1 = require("@nestjs/common");
const amqp_connection_manager_1 = require("amqp-connection-manager");
const ROUTING_KEY = {
    'payment.approved': 'payment.confirmed',
    'payment.rejected': 'payment.failed',
    'payment.refunded': 'payment.refunded',
};
let BillingEventPublisher = BillingEventPublisher_1 = class BillingEventPublisher {
    constructor() {
        this.logger = new common_1.Logger(BillingEventPublisher_1.name);
        this.exchange = 'payment.events';
        this.url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        this.connection = (0, amqp_connection_manager_1.connect)([this.url]);
    }
    async publishPaymentResult(event) {
        const routingKey = ROUTING_KEY[event.type];
        const payload = {
            orderId: event.serviceOrderId,
            ...('reason' in event ? { reason: event.reason } : {}),
        };
        try {
            const channel = this.connection.createChannel({
                setup: async (currentChannel) => {
                    await currentChannel.assertExchange(this.exchange, 'topic', { durable: true });
                },
            });
            await channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(payload)), { contentType: 'application/json', persistent: true });
            this.logger.log(`Published ${routingKey} for order ${event.serviceOrderId}`);
        }
        catch (error) {
            const reason = error instanceof Error ? error.message : 'unknown-error';
            this.logger.warn(`Event publish skipped: ${reason}`);
        }
    }
};
exports.BillingEventPublisher = BillingEventPublisher;
exports.BillingEventPublisher = BillingEventPublisher = BillingEventPublisher_1 = __decorate([
    (0, common_1.Injectable)()
], BillingEventPublisher);
//# sourceMappingURL=billing-event-publisher.js.map