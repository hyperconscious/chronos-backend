import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1743016172468 implements MigrationInterface {
    name = 'Migrations1743016172468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`event\` ADD \`isNotifiedStart\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`event\` ADD \`isNotifiedEnd\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`isNotifiedEnd\``);
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`isNotifiedStart\``);
    }

}
