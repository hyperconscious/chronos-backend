// tag.entity.ts
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
    JoinTable,
    ManyToOne,
} from 'typeorm';

import { Event } from './event.entity';
import { Calendar } from './calendar.entity';

@Entity()
@Unique(['id'])
export class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ default: '#6c757d' })
    color!: string;

    @Column({ nullable: true })
    description?: string;

    @ManyToMany(() => Event, event => event.tags)
    @JoinTable()
    events?: Event[];

    @ManyToOne(() => Calendar, calendar => calendar.tags)
    calendar!: Calendar;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}