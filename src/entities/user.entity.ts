import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, Length } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Calendar } from './calendar.entity';
import { Event } from './event.entity';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

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

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role!: UserRole;

  @ManyToMany(() => Calendar, calendar => calendar.users)
  @JoinTable()
  calendars!: Calendar[];

  @ManyToMany(() => Event, event => event.participants)
  @JoinTable()
  events!: Event[];

  @OneToMany(() => Event, event => event.creator)
  createdEvents!: Event[];

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