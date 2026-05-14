"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const charge_typeorm_entity_1 = require("./modules/billing/infrastructure/persistence/charge.typeorm.entity");
const webhook_event_typeorm_entity_1 = require("./modules/billing/infrastructure/persistence/webhook-event.typeorm.entity");
const _1_CreateChargesTable_1 = require("./modules/billing/infrastructure/persistence/migrations/1-CreateChargesTable");
const _2_CreateWebhookEventsTable_1 = require("./modules/billing/infrastructure/persistence/migrations/2-CreateWebhookEventsTable");
const _3_AddRefundedStatus_1 = require("./modules/billing/infrastructure/persistence/migrations/3-AddRefundedStatus");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'billing',
    password: process.env.DB_PASS ?? 'billing',
    database: process.env.DB_NAME ?? 'billing',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    entities: [charge_typeorm_entity_1.ChargeOrmEntity, webhook_event_typeorm_entity_1.WebhookEventOrmEntity],
    migrations: [_1_CreateChargesTable_1.CreateChargesTable1, _2_CreateWebhookEventsTable_1.CreateWebhookEventsTable2, _3_AddRefundedStatus_1.AddRefundedStatus3],
});
//# sourceMappingURL=data-source.js.map