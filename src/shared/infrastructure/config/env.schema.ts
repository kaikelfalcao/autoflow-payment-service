import * as Joi from "joi";

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3004),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  RABBITMQ_URL: Joi.string().default("amqp://admin:admin@localhost:5672"),

  MP_ACCESS_TOKEN: Joi.string().optional().allow(""),
  MP_NOTIFICATION_URL: Joi.string().uri().optional().allow(""),
  MP_MOCK: Joi.boolean().default(false),
}).options({ allowUnknown: true });
