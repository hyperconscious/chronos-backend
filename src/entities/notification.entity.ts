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

export enum NotificationType {
    EventReminder = 'event_reminder',
    EventChange = 'event_change',
    EventCancellation = 'event_cancellation',
    EventInvitation = 'event_invitation',
}

@Entity()
@Unique(['id'])
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;
    
    @Column({ type: 'text' })
    message!: string;
    
    @Column({
    type: 'enum',
    enum: NotificationType
    })
    type!: NotificationType;
    
    @Column({ default: false })
    isRead!: boolean;
    
    @ManyToOne(() => User)
    @JoinColumn()
    user!: User;
    
    @ManyToOne(() => Event, { nullable: true })
    @JoinColumn()
    relatedEvent?: Event;
    
    @CreateDateColumn()
    createdAt!: Date;
}