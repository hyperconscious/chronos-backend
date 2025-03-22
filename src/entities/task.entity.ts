// task.entity.ts
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Event } from './event.entity';

export enum TaskPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    Urgent = 'urgent'
}

@Entity()
@Unique(['id'])
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;
    
    @Column({ nullable: true, type: 'text' })
    description?: string;
    
    @Column({ nullable: true, type: 'timestamp' })
    dueDate?: Date;
    
    @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.Medium
    })
    priority!: TaskPriority;
    
    @Column({ default: false })
    isCompleted!: boolean;
    
    @ManyToOne(() => User)
    @JoinColumn()
    assignee!: User;
    
    @ManyToOne(() => Event, { nullable: true })
    @JoinColumn()
    relatedEvent?: Event;
    
    @CreateDateColumn()
    createdAt!: Date;
    
    @UpdateDateColumn()
    updatedAt!: Date;
}