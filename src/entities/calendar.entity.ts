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
  
@Entity()
@Unique(['id'])
export class Calendar {
      @PrimaryGeneratedColumn()
      id!: number;

      @Column()
      title!: string;
      
      @Column({ nullable: true })
      description?: string;

      @ManyToOne(() => User, { eager: true })
      @JoinColumn({ name: 'user_id' })
      owner!: User;

      @ManyToMany(() => User, user => user.calendars)
      @JoinTable()
      visitors?: User[];
      
      @OneToMany(() => Event, event => event.calendar)
      events?: Event[];

      @OneToMany(() => Tag, tag => tag.calendar)
      tags?: Tag[];
      
      @CreateDateColumn()
      createdAt!: Date;
      
      @UpdateDateColumn()
      updatedAt!: Date;
}