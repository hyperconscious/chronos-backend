// event.entity.ts (updated)
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
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
    Yearly = 'yearly',
    Custom = 'custom'
}

export enum EventPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    Urgent = 'urgent'
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
    endTime!: Date;
    
    @Column({ default: false })
    isAllDay!: boolean;
    
    @Column({ nullable: true })
    location?: string;
    
    @Column({
    type: 'enum',
    enum: EventRecurrence,
    default: EventRecurrence.None
    })
    recurrence!: EventRecurrence;
    
    @Column({ nullable: true })
    recurrenceEndDate?: Date;
    
    @Column({
    type: 'enum',
    enum: EventPriority,
    default: EventPriority.Medium
    })
    priority!: EventPriority;
    
    @Column({ default: false })
    isCompleted!: boolean;
    
    @ManyToOne(() => Calendar, calendar => calendar.events)
    @JoinColumn()
    calendar!: Calendar;
    
    @ManyToOne(() => User, user => user.createdEvents)
    @JoinColumn()
    creator!: User;
    
    @ManyToMany(() => User, user => user.events)
    participants!: User[];
    
    @ManyToMany(() => Tag, tag => tag.events)
    tags!: Tag[];
    
    @CreateDateColumn()
    createdAt!: Date;
    
    @UpdateDateColumn()
    updatedAt!: Date;
}