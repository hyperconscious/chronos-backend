import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1742671994947 implements MigrationInterface {
    name = 'Migrations1742671994947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tag\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`color\` varchar(255) NOT NULL DEFAULT '#6c757d', \`description\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8e4052373c579afc1471f52676\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tag_events_event\` (\`tagId\` int NOT NULL, \`eventId\` int NOT NULL, INDEX \`IDX_bf38287323e91e9dfc2a492ffe\` (\`tagId\`), INDEX \`IDX_dd502c817c477cc2b229af6a83\` (\`eventId\`), PRIMARY KEY (\`tagId\`, \`eventId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`tag_events_event\` ADD CONSTRAINT \`FK_bf38287323e91e9dfc2a492ffe3\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tag_events_event\` ADD CONSTRAINT \`FK_dd502c817c477cc2b229af6a839\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tag_events_event\` DROP FOREIGN KEY \`FK_dd502c817c477cc2b229af6a839\``);
        await queryRunner.query(`ALTER TABLE \`tag_events_event\` DROP FOREIGN KEY \`FK_bf38287323e91e9dfc2a492ffe3\``);
        await queryRunner.query(`DROP INDEX \`IDX_dd502c817c477cc2b229af6a83\` ON \`tag_events_event\``);
        await queryRunner.query(`DROP INDEX \`IDX_bf38287323e91e9dfc2a492ffe\` ON \`tag_events_event\``);
        await queryRunner.query(`DROP TABLE \`tag_events_event\``);
        await queryRunner.query(`DROP INDEX \`IDX_8e4052373c579afc1471f52676\` ON \`tag\``);
        await queryRunner.query(`DROP TABLE \`tag\``);
    }

}
