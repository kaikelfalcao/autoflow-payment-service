import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWebhookEventsTable1700000010002 implements MigrationInterface {
  name = "CreateWebhookEventsTable1700000010002";

  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      CREATE TABLE webhook_events (
        id               UUID        NOT NULL DEFAULT gen_random_uuid(),
        charge_id        UUID        NOT NULL,
        service_order_id UUID        NOT NULL,
        mp_payment_id    VARCHAR     NOT NULL,
        action           VARCHAR     NOT NULL,
        status           VARCHAR     NOT NULL,
        raw_payload      JSONB       NOT NULL,
        processed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT pk_webhook_events PRIMARY KEY (id)
      );

      CREATE INDEX idx_webhook_events_charge_id    ON webhook_events (charge_id);
      CREATE INDEX idx_webhook_events_mp_payment_id ON webhook_events (mp_payment_id);
    `);
  }

  async down(runner: QueryRunner): Promise<void> {
    await runner.query(`DROP TABLE webhook_events;`);
  }
}
