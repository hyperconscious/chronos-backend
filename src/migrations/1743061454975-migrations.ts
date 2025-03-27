import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1743061454975 implements MigrationInterface {
    name = 'Migrations1743061454975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP FOREIGN KEY \`FK_446aaf814114cb31ff287ff7431\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP FOREIGN KEY \`FK_5a06ab90f23771872da46a4a087\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP COLUMN \`calendarId\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD \`calendar_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD CONSTRAINT \`FK_cb549fc9ec760fc1952905cad94\` FOREIGN KEY (\`calendar_id\`) REFERENCES \`calendar\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD CONSTRAINT \`FK_5e0d3af337a5f0ee36ea461df8b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP FOREIGN KEY \`FK_5e0d3af337a5f0ee36ea461df8b\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP FOREIGN KEY \`FK_cb549fc9ec760fc1952905cad94\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` DROP COLUMN \`calendar_id\``);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD \`calendarId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD CONSTRAINT \`FK_5a06ab90f23771872da46a4a087\` FOREIGN KEY (\`calendarId\`) REFERENCES \`calendar\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_in_calendar\` ADD CONSTRAINT \`FK_446aaf814114cb31ff287ff7431\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
