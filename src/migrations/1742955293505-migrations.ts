import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1742955293505 implements MigrationInterface {
    name = 'Migrations1742955293505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`event\` ADD \`calendar_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`event\` ADD CONSTRAINT \`FK_30d40d7e1d263072ea51d54ec1c\` FOREIGN KEY (\`calendar_id\`) REFERENCES \`calendar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_30d40d7e1d263072ea51d54ec1c\``);
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`calendar_id\``);
    }

}
