"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChargesTable1 = void 0;
class CreateChargesTable1 {
    constructor() {
        this.name = 'CreateChargesTable1';
    }
    async up(runner) {
        await runner.query(`
      CREATE TYPE charge_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

      CREATE TABLE charges (
        id                UUID            NOT NULL,
        service_order_id  UUID            NOT NULL,
        customer_id       UUID            NOT NULL,
        total_cents       INT             NOT NULL,
        status            charge_status_enum NOT NULL DEFAULT 'PENDING',
        mp_preference_id  VARCHAR,
        mp_payment_id     VARCHAR,
        checkout_url      VARCHAR,
        created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

        CONSTRAINT pk_charges PRIMARY KEY (id),
        CONSTRAINT uq_charges_service_order UNIQUE (service_order_id)
      );

      CREATE INDEX idx_charges_status ON charges (status);
    `);
    }
    async down(runner) {
        await runner.query(`
      DROP TABLE charges;
      DROP TYPE charge_status_enum;
    `);
    }
}
exports.CreateChargesTable1 = CreateChargesTable1;
//# sourceMappingURL=1-CreateChargesTable.js.map