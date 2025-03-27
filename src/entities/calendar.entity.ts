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

  import { User } from './user.entity';
  import { Event } from './event.entity';
import { Tag } from './tag.entity';
import { on } from 'events';
import { UserInCalendar as UserInCalendar } from './userInCalendar.entity';

@Entity()
@Unique(['id'])
export class Calendar {
      @PrimaryGeneratedColumn()
      id!: number;

      @Column()
      title!: string;

      @Column({ nullable: true })
      description?: string;

      @OneToMany(() => UserInCalendar, user => user.id)
      users?: UserInCalendar[];

      @OneToMany(() => Event, event => event.calendar, { cascade: true, onDelete: "CASCADE" })
      events?: Event[];

      @OneToMany(() => Tag, tag => tag.calendar, { cascade: true, onDelete: "CASCADE" })
      tags?: Tag[];


      @CreateDateColumn()
      createdAt!: Date;

      @UpdateDateColumn()
      updatedAt!: Date;
}