import {
    Column,
    CreateDateColumn,
    Entity,
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
import { UserInCalendar } from './userInCalendar.entity';
import { Notification } from './notification.entity';


@Entity()
@Unique(['login', 'email'])
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    @Length(4, 20)
    login!: string;

    @Column()
    password!: string;

    @Column()
    full_name!: string;

    @Column({ unique: true })
    @IsEmail()
    email!: string;

    @Column({ default: false })
    verified!: boolean;

    @Column({ default: '' })
    avatar?: string;

    @OneToMany(() => UserInCalendar, uic => uic.user)
    calendarsRole?: UserInCalendar[];

    @OneToMany(() => Event, event => event.creator)
    createdEvents?: Event[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications!: Notification[];

    @Column()
    @CreateDateColumn()
    public createdAt!: Date;

    @Column()
    @UpdateDateColumn()
    public updatedAt!: Date;

    public hashPassword() {
        this.password = bcrypt.hashSync(this.password, 7);
    }

    public comparePassword(unencryptedPassword: string) {
        return bcrypt.compareSync(unencryptedPassword, this.password);
    }
}