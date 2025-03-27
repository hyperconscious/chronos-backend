import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1743060486409 implements MigrationInterface {
    name = 'Migrations1743060486409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`calendar\` DROP FOREIGN KEY \`FK_e19fb6bccd41688d5956652baf5\``);
        await queryRunner.query(`CREATE TABLE \`user_in_calendar\` (\`id\` int NOT NULL AUTO_INCREMENT, \`role\` enum ('visitor', 'editor', 'admin', 'owner') NOT NULL DEFAULT 'visitor', \`calendarId\` int NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`calendar\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD CONSTRAINT \`FK_5a06ab90f23771872da46a4a087\` FOREIGN KEY (\`calendarId\`) REFERENCES \`calendar\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD CONSTRAINT \`FK_446aaf814114cb31ff287ff7431\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP FOREIGN KEY \`FK_446aaf814114cb31ff287ff7431\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP FOREIGN KEY \`FK_5a06ab90f23771872da46a4a087\``);
        await queryRunner.query(`ALTER TABLE \`calendar\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`DROP TABLE \`user_in_calendar\``);
        await queryRunner.query(`ALTER TABLE \`calendar\` ADD CONSTRAINT \`FK_e19fb6bccd41688d5956652baf5\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
