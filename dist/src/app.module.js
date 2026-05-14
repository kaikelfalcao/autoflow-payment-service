"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const env_schema_1 = require("./shared/infrastructure/config/env.schema");
const health_module_1 = require("./shared/infrastructure/health/health.module");
const rabbitmq_module_1 = require("./infrastructure/messaging/rabbitmq.module");
const billing_module_1 = require("./modules/billing/billing.module");
const charge_typeorm_entity_1 = require("./modules/billing/infrastructure/persistence/charge.typeorm.entity");
const webhook_event_typeorm_entity_1 = require("./modules/billing/infrastructure/persistence/webhook-event.typeorm.entity");
const _1_CreateChargesTable_1 = require("./modules/billing/infrastructure/persistence/migrations/1-CreateChargesTable");
const _2_CreateWebhookEventsTable_1 = require("./modules/billing/infrastructure/persistence/migrations/2-CreateWebhookEventsTable");
const _3_AddRefundedStatus_1 = require("./modules/billing/infrastructure/persistence/migrations/3-AddRefundedStatus");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                ignoreEnvFile: process.env.NODE_ENV === 'production',
                validationSchema: env_schema_1.envSchema,
                validationOptions: { abortEarly: false },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.getOrThrow('DB_HOST'),
                    port: config.get('DB_PORT', 5432),
                    username: config.getOrThrow('DB_USER'),
                    password: config.getOrThrow('DB_PASS'),
                    database: config.getOrThrow('DB_NAME'),
                    ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
                    entities: [charge_typeorm_entity_1.ChargeOrmEntity, webhook_event_typeorm_entity_1.WebhookEventOrmEntity],
                    migrations: [_1_CreateChargesTable_1.CreateChargesTable1, _2_CreateWebhookEventsTable_1.CreateWebhookEventsTable2, _3_AddRefundedStatus_1.AddRefundedStatus3],
                    migrationsRun: false,
                    synchronize: false,
                    logging: config.get('NODE_ENV') !== 'production',
                }),
            }),
            rabbitmq_module_1.RabbitMqModule,
            health_module_1.HealthModule,
            billing_module_1.BillingModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map