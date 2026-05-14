"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventPublisherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisherService = void 0;
const common_1 = require("@nestjs/common");
const amqp_connection_manager_1 = require("amqp-connection-manager");
let EventPublisherService = EventPublisherService_1 = class EventPublisherService {
    constructor() {
        this.logger = new common_1.Logger(EventPublisherService_1.name);
        this.url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        this.connection = (0, amqp_connection_manager_1.connect)([this.url]);
    }
    async publish(params) {
        try {
            const channel = this.connection.createChannel({
                setup: async (currentChannel) => {
                    await currentChannel.assertExchange(params.exchange, 'topic', { durable: true });
                },
            });
            await channel.publish(params.exchange, params.routingKey, Buffer.from(JSON.stringify(params.event)), { contentType: 'application/json', persistent: true });
        }
        catch (error) {
            const reason = error instanceof Error ? error.message : 'unknown-error';
            this.logger.warn(`Event publish skipped: ${reason}`);
        }
    }
};
exports.EventPublisherService = EventPublisherService;
exports.EventPublisherService = EventPublisherService = EventPublisherService_1 = __decorate([
    (0, common_1.Injectable)()
], EventPublisherService);
//# sourceMappingURL=event-publisher.service.js.map