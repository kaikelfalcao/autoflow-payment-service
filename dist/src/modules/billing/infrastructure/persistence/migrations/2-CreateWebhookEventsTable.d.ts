import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateWebhookEventsTable2 implements MigrationInterface {
    name: string;
    up(runner: QueryRunner): Promise<void>;
    down(runner: QueryRunner): Promise<void>;
}
