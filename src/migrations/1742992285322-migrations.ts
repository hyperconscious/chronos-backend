import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1742992285322 implements MigrationInterface {
    name = 'Migrations1742992285322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`calendar\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NULL, UNIQUE INDEX \`IDX_2492fb846a48ea16d53864e326\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`login\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`full_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`verified\` tinyint NOT NULL DEFAULT 0, \`avatar\` varchar(255) NOT NULL DEFAULT '', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a62473490b3e4578fd683235c5\` (\`login\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_bec1a7d56ad6e762a1e2ce527b\` (\`login\`, \`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`event\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`startTime\` timestamp NOT NULL, \`endTime\` timestamp NOT NULL, \`type\` enum ('arrangement', 'reminder', 'task') NOT NULL DEFAULT 'arrangement', \`recurrence\` enum ('none', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly') NOT NULL DEFAULT 'none', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`creatorId\` int NULL, \`calendar_id\` int NULL, UNIQUE INDEX \`IDX_30c2f3bbaf6d34a55f8ae6e461\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tag\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`color\` varchar(255) NOT NULL DEFAULT '#6c757d', \`description\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`calendarId\` int NULL, UNIQUE INDEX \`IDX_8e4052373c579afc1471f52676\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`type\` enum ('event_reminder', 'event_change', 'event_cancellation', 'event_invitation') NOT NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`relatedEventId\` int NULL, UNIQUE INDEX \`IDX_705b6c7cdf9b2c2ff7ac7872cb\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`calendar_visitors_user\` (\`calendarId\` int NOT NULL, \`userId\` int NOT NULL, INDEX \`IDX_4cfbe8b05f60d2b4fd6a5744d9\` (\`calendarId\`), INDEX \`IDX_0461595afa6bc56810f6bcc256\` (\`userId\`), PRIMARY KEY (\`calendarId\`, \`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`event_tags_tag\` (\`eventId\` int NOT NULL, \`tagId\` int NOT NULL, INDEX \`IDX_c04045ef5aceb3f9a5d1297ece\` (\`eventId\`), INDEX \`IDX_28a457412550e4d06eb24673b6\` (\`tagId\`), PRIMARY KEY (\`eventId\`, \`tagId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tag_events_event\` (\`tagId\` int NOT NULL, \`eventId\` int NOT NULL, INDEX \`IDX_bf38287323e91e9dfc2a492ffe\` (\`tagId\`), INDEX \`IDX_dd502c817c477cc2b229af6a83\` (\`eventId\`), PRIMARY KEY (\`tagId\`, \`eventId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`calendar\` ADD CONSTRAINT \`FK_e19fb6bccd41688d5956652baf5\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event\` ADD CONSTRAINT \`FK_7a773352fcf1271324f2e5a3e41\` FOREIGN KEY (\`creatorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event\` ADD CONSTRAINT \`FK_30d40d7e1d263072ea51d54ec1c\` FOREIGN KEY (\`calendar_id\`) REFERENCES \`calendar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tag\` ADD CONSTRAINT \`FK_5c1ba3e345294b651465f01b0ab\` FOREIGN KEY (\`calendarId\`) REFERENCES \`calendar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_1ced25315eb974b73391fb1c81b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_9c689ac3c47ef9b1e1876784571\` FOREIGN KEY (\`relatedEventId\`) REFERENCES \`event\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`calendar_visitors_user\` ADD CONSTRAINT \`FK_4cfbe8b05f60d2b4fd6a5744d9b\` FOREIGN KEY (\`calendarId\`) REFERENCES \`calendar\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`calendar_visitors_user\` ADD CONSTRAINT \`FK_0461595afa6bc56810f6bcc2561\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_tags_tag\` ADD CONSTRAINT \`FK_c04045ef5aceb3f9a5d1297eceb\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`event_tags_tag\` ADD CONSTRAINT \`FK_28a457412550e4d06eb24673b68\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tag_events_event\` ADD CONSTRAINT \`FK_bf38287323e91e9dfc2a492ffe3\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tag_events_event\` ADD CONSTRAINT \`FK_dd502c817c477cc2b229af6a839\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tag_events_event\` DROP FOREIGN KEY \`FK_dd502c817c477cc2b229af6a839\``);
        await queryRunner.query(`ALTER TABLE \`tag_events_event\` DROP FOREIGN KEY \`FK_bf38287323e91e9dfc2a492ffe3\``);
        await queryRunner.query(`ALTER TABLE \`event_tags_tag\` DROP FOREIGN KEY \`FK_28a457412550e4d06eb24673b68\``);
        await queryRunner.query(`ALTER TABLE \`event_tags_tag\` DROP FOREIGN KEY \`FK_c04045ef5aceb3f9a5d1297eceb\``);
        await queryRunner.query(`ALTER TABLE \`calendar_visitors_user\` DROP FOREIGN KEY \`FK_0461595afa6bc56810f6bcc2561\``);
        await queryRunner.query(`ALTER TABLE \`calendar_visitors_user\` DROP FOREIGN KEY \`FK_4cfbe8b05f60d2b4fd6a5744d9b\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_9c689ac3c47ef9b1e1876784571\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_1ced25315eb974b73391fb1c81b\``);
        await queryRunner.query(`ALTER TABLE \`tag\` DROP FOREIGN KEY \`FK_5c1ba3e345294b651465f01b0ab\``);
        await queryRunner.query(`ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_30d40d7e1d263072ea51d54ec1c\``);
        await queryRunner.query(`ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_7a773352fcf1271324f2e5a3e41\``);
        await queryRunner.query(`ALTER TABLE \`calendar\` DROP FOREIGN KEY \`FK_e19fb6bccd41688d5956652baf5\``);
        await queryRunner.query(`DROP INDEX \`IDX_dd502c817c477cc2b229af6a83\` ON \`tag_events_event\``);
        await queryRunner.query(`DROP INDEX \`IDX_bf38287323e91e9dfc2a492ffe\` ON \`tag_events_event\``);
        await queryRunner.query(`DROP TABLE \`tag_events_event\``);
        await queryRunner.query(`DROP INDEX \`IDX_28a457412550e4d06eb24673b6\` ON \`event_tags_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_c04045ef5aceb3f9a5d1297ece\` ON \`event_tags_tag\``);
        await queryRunner.query(`DROP TABLE \`event_tags_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_0461595afa6bc56810f6bcc256\` ON \`calendar_visitors_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_4cfbe8b05f60d2b4fd6a5744d9\` ON \`calendar_visitors_user\``);
        await queryRunner.query(`DROP TABLE \`calendar_visitors_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_705b6c7cdf9b2c2ff7ac7872cb\` ON \`notification\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP INDEX \`IDX_8e4052373c579afc1471f52676\` ON \`tag\``);
        await queryRunner.query(`DROP TABLE \`tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_30c2f3bbaf6d34a55f8ae6e461\` ON \`event\``);
        await queryRunner.query(`DROP TABLE \`event\``);
        await queryRunner.query(`DROP INDEX \`IDX_bec1a7d56ad6e762a1e2ce527b\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_a62473490b3e4578fd683235c5\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_2492fb846a48ea16d53864e326\` ON \`calendar\``);
        await queryRunner.query(`DROP TABLE \`calendar\``);
    }

}
