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
var PaymentRequestedConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRequestedConsumer = void 0;
const common_1 = require("@nestjs/common");
const amqp_connection_manager_1 = require("amqp-connection-manager");
const create_charge_use_case_1 = require("../../application/use-cases/create-charge/create-charge.use-case");
let PaymentRequestedConsumer = PaymentRequestedConsumer_1 = class PaymentRequestedConsumer {
    constructor(createCharge) {
        this.createCharge = createCharge;
        this.logger = new common_1.Logger(PaymentRequestedConsumer_1.name);
    }
    async onModuleInit() {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        const connection = (0, amqp_connection_manager_1.connect)([rabbitUrl]);
        const channel = connection.createChannel({
            setup: async (currentChannel) => {
                await currentChannel.assertExchange('order.events', 'topic', { durable: true });
                await currentChannel.assertQueue('billing.payment.requested', { durable: true });
                await currentChannel.bindQueue('billing.payment.requested', 'order.events', 'order.payment.requested');
                await currentChannel.consume('billing.payment.requested', async (message) => {
                    if (!message)
                        return;
                    try {
                        const event = JSON.parse(message.content.toString());
                        const { payload } = event;
                        this.logger.log(`Processing payment.requested for order ${payload.orderId}`);
                        await this.createCharge.execute({
                            serviceOrderId: payload.orderId,
                            customerId: payload.customerCpf,
                            totalCents: Math.round(payload.totalAmount * 100),
                        });
                        currentChannel.ack(message);
                    }
                    catch (error) {
                        const reason = error instanceof Error ? error.message : 'unknown-error';
                        this.logger.warn(`Failed to process payment.requested: ${reason}`);
                        currentChannel.nack(message, false, false);
                    }
                });
            },
        });
        channel.on('error', (error) => {
            const reason = error instanceof Error ? error.message : 'unknown-error';
            this.logger.warn(`Payment requested consumer channel error: ${reason}`);
        });
    }
};
exports.PaymentRequestedConsumer = PaymentRequestedConsumer;
exports.PaymentRequestedConsumer = PaymentRequestedConsumer = PaymentRequestedConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [create_charge_use_case_1.CreateChargeUseCase])
], PaymentRequestedConsumer);
//# sourceMappingURL=payment-requested-consumer.js.map