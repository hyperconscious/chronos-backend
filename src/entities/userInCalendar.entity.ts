

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { IsEmail, Length } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Calendar } from './calendar.entity';
import { Event } from './event.entity';
import { User } from './user.entity';

export enum UserRole
{
    visitor = 'visitor', // can see events
    editor = 'editor', // ..can edit events
    admin = 'admin', // ..can edit calendar and add/remove users
    owner = 'owner', // can edit calendar and add/remove admins
}


@Entity()
@Unique(['user', 'calendar'])
export class UserInCalendar {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Calendar, (calendar) => calendar.users, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: "calendar_id" })
    calendar!: Calendar;

    @ManyToOne(() => User, (user) => user.calendarsRole, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.visitor,
    })
    role!: UserRole;
}