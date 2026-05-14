"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const Joi = require("joi");
exports.envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3001),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    RABBITMQ_URL: Joi.string().default('amqp://localhost:5672'),
    MP_ACCESS_TOKEN: Joi.string().required(),
    MP_NOTIFICATION_URL: Joi.string().uri().required(),
}).options({ allowUnknown: true });
//# sourceMappingURL=env.schema.js.map