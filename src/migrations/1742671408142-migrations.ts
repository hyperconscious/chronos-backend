import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1742671408142 implements MigrationInterface {
    name = 'Migrations1742671408142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`event\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`startTime\` timestamp NOT NULL, \`endTime\` timestamp NOT NULL, \`isAllDay\` tinyint NOT NULL DEFAULT 0, \`location\` varchar(255) NULL, \`recurrence\` enum ('none', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom') NOT NULL DEFAULT 'none', \`recurrenceEndDate\` datetime NULL, \`priority\` enum ('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium', \`isCompleted\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`calendarId\` int NULL, \`creatorId\` int NULL, UNIQUE INDEX \`IDX_30c2f3bbaf6d34a55f8ae6e461\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`calendar\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`color\` varchar(255) NOT NULL DEFAULT '#3498db', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_2492fb846a48ea16d53864e326\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`dueDate\` timestamp NULL, \`priority\` enum ('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium', \`isCompleted\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`assigneeId\` int NULL, \`relatedEventId\` int NULL, UNIQUE INDEX \`IDX_fb213f79ee45060ba925ecd576\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`type\` enum ('event_reminder', 'event_invitation', 'task_reminder', 'task_assignment', 'system_notification') NOT NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`relatedEventId\` int NULL, UNIQUE INDEX \`IDX_705b6c7cdf9b2c2ff7ac7872cb\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_calendars_calendar\` (\`userId\` int NOT NULL, \`calendarId\` int NOT NULL, INDEX \`IDX_8d35819fe3903fdc7645b18fd2\` (\`userId\`), INDEX \`IDX_22ffebd2e8f17771cdba65e0ba\` (\`calendarId\`), PRIMARY KEY (\`userId\`, \`calendarId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_events_event\` (\`userId\` int NOT NULL, \`eventId\` int NOT NULL, INDEX \`IDX_507e9d8e231d089b5c4d44cce0\` (\`userId\`), INDEX \`IDX_c885fff747e43934134ceb67d3\` (\`eventId\`), PRIMARY KEY (\`userId\`, \`eventId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`event\` ADD CONSTRAINT \`FK_9ed681dd5aacb6842046c7b657b\` FOREIGN KEY (\`calendarId\`) REFERENCES \`calendar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event\` ADD CONSTRAINT \`FK_7a773352fcf1271324f2e5a3e41\` FOREIGN KEY (\`creatorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_7384988f7eeb777e44802a0baca\` FOREIGN KEY (\`assigneeId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_1be30170e29cee7b3a4e3e55ede\` FOREIGN KEY (\`relatedEventId\`) REFERENCES \`event\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_1ced25315eb974b73391fb1c81b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_9c689ac3c47ef9b1e1876784571\` FOREIGN KEY (\`relatedEventId\`) REFERENCES \`event\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_calendars_calendar\` ADD CONSTRAINT \`FK_8d35819fe3903fdc7645b18fd2d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_calendars_calendar\` ADD CONSTRAINT \`FK_22ffebd2e8f17771cdba65e0ba5\` FOREIGN KEY (\`calendarId\`) REFERENCES \`calendar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_events_event\` ADD CONSTRAINT \`FK_507e9d8e231d089b5c4d44cce00\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_events_event\` ADD CONSTRAINT \`FK_c885fff747e43934134ceb67d33\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_events_event\` DROP FOREIGN KEY \`FK_c885fff747e43934134ceb67d33\``);
        await queryRunner.query(`ALTER TABLE \`user_events_event\` DROP FOREIGN KEY \`FK_507e9d8e231d089b5c4d44cce00\``);
        await queryRunner.query(`ALTER TABLE \`user_calendars_calendar\` DROP FOREIGN KEY \`FK_22ffebd2e8f17771cdba65e0ba5\``);
        await queryRunner.query(`ALTER TABLE \`user_calendars_calendar\` DROP FOREIGN KEY \`FK_8d35819fe3903fdc7645b18fd2d\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_9c689ac3c47ef9b1e1876784571\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_1ced25315eb974b73391fb1c81b\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_1be30170e29cee7b3a4e3e55ede\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_7384988f7eeb777e44802a0baca\``);
        await queryRunner.query(`ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_7a773352fcf1271324f2e5a3e41\``);
        await queryRunner.query(`ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_9ed681dd5aacb6842046c7b657b\``);
        await queryRunner.query(`DROP INDEX \`IDX_c885fff747e43934134ceb67d3\` ON \`user_events_event\``);
        await queryRunner.query(`DROP INDEX \`IDX_507e9d8e231d089b5c4d44cce0\` ON \`user_events_event\``);
        await queryRunner.query(`DROP TABLE \`user_events_event\``);
        await queryRunner.query(`DROP INDEX \`IDX_22ffebd2e8f17771cdba65e0ba\` ON \`user_calendars_calendar\``);
        await queryRunner.query(`DROP INDEX \`IDX_8d35819fe3903fdc7645b18fd2\` ON \`user_calendars_calendar\``);
        await queryRunner.query(`DROP TABLE \`user_calendars_calendar\``);
        await queryRunner.query(`DROP INDEX \`IDX_705b6c7cdf9b2c2ff7ac7872cb\` ON \`notification\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP INDEX \`IDX_fb213f79ee45060ba925ecd576\` ON \`task\``);
        await queryRunner.query(`DROP TABLE \`task\``);
        await queryRunner.query(`DROP INDEX \`IDX_2492fb846a48ea16d53864e326\` ON \`calendar\``);
        await queryRunner.query(`DROP TABLE \`calendar\``);
        await queryRunner.query(`DROP INDEX \`IDX_30c2f3bbaf6d34a55f8ae6e461\` ON \`event\``);
        await queryRunner.query(`DROP TABLE \`event\``);
    }

}
