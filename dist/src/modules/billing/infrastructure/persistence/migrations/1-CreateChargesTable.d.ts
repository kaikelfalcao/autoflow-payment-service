import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateChargesTable1 implements MigrationInterface {
    name: string;
    up(runner: QueryRunner): Promise<void>;
    down(runner: QueryRunner): Promise<void>;
}
