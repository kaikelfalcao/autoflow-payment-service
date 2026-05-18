import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefundedStatus1700000010003 implements MigrationInterface {
  name = 'AddRefundedStatus1700000010003';

  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`ALTER TYPE charge_status_enum ADD VALUE 'REFUNDED'`);
  }

  async down(runner: QueryRunner): Promise<void> {
    // PostgreSQL não permite remover valores de enum diretamente.
    // Para reverter, é necessário recriar o tipo e a coluna.
    await runner.query(`
      ALTER TABLE charges ALTER COLUMN status TYPE VARCHAR;
      DROP TYPE charge_status_enum;
      CREATE TYPE charge_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
      ALTER TABLE charges ALTER COLUMN status TYPE charge_status_enum USING status::charge_status_enum;
    `);
  }
}
