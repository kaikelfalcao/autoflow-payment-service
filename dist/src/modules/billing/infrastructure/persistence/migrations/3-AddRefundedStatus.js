"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRefundedStatus3 = void 0;
class AddRefundedStatus3 {
    constructor() {
        this.name = 'AddRefundedStatus3';
    }
    async up(runner) {
        await runner.query(`ALTER TYPE charge_status_enum ADD VALUE 'REFUNDED'`);
    }
    async down(runner) {
        await runner.query(`
      ALTER TABLE charges ALTER COLUMN status TYPE VARCHAR;
      DROP TYPE charge_status_enum;
      CREATE TYPE charge_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
      ALTER TABLE charges ALTER COLUMN status TYPE charge_status_enum USING status::charge_status_enum;
    `);
    }
}
exports.AddRefundedStatus3 = AddRefundedStatus3;
//# sourceMappingURL=3-AddRefundedStatus.js.map