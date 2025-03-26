// event.entity.ts (updated)
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Calendar } from './calendar.entity';
import { Tag } from './tag.entity';

export enum EventRecurrence {
    None = 'none',
    Daily = 'daily',
    Weekly = 'weekly',
    BiWeekly = 'biweekly',
    Monthly = 'monthly',
    Yearly = 'yearly'
}

export enum EventType {
    Arrangement = 'arrangement',
    Reminder = 'reminder',
    Task = 'task',
}

@Entity()
@Unique(['id'])
export class Event {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;
    
    @Column({ nullable: true, type: 'text' })
    description?: string;
    
    @Column({ type: 'timestamp' })
    startTime!: Date;
    
    @Column({ type: 'timestamp' })
    endTime?: Date;
    
    @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.Arrangement
    })
    type!: EventType;

    @Column({
    type: 'enum',
    enum: EventRecurrence,
    default: EventRecurrence.None
    })
    recurrence!: EventRecurrence;
    
    @ManyToOne(() => User, user => user.createdEvents)
    @JoinColumn()
    creator!: User;
    
    @ManyToMany(() => Tag, tag => tag.events)
    @JoinTable()
    tags?: Tag[];

    @ManyToOne(() => Calendar, calendar => calendar.events)
    @JoinColumn({ name: 'calendar_id' })
    calendar!: Calendar;
    
    @CreateDateColumn()
    createdAt!: Date;
    
    @UpdateDateColumn()
    updatedAt!: Date;
}