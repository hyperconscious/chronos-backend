import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1743097924320 implements MigrationInterface {
    name = 'Migrations1743097924320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`event\` ADD \`color\` varchar(255) NOT NULL DEFAULT '#007bff'`);
        await queryRunner.query(`ALTER TABLE \`notification\` CHANGE \`type\` \`type\` enum ('event_reminder', 'event_change', 'event_cancellation', 'event_invitation') NOT NULL DEFAULT 'event_reminder'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification\` CHANGE \`type\` \`type\` enum ('event_reminder', 'event_change', 'event_cancellation', 'event_invitation') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`color\``);
    }

}
