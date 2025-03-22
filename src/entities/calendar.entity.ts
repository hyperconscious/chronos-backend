import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
  } from 'typeorm';
  
  import { User } from './user.entity';
  import { Event } from './event.entity';
  
  @Entity()
  @Unique(['id'])
  export class Calendar {
      @PrimaryGeneratedColumn()
      id!: number;
  
      @Column()
      title!: string;
      
      @Column({ nullable: true })
      description?: string;
      
      @Column({ default: '#3498db' })
      color!: string;
  
      @ManyToMany(() => User, user => user.calendars)
      users!: User[];
      
      @OneToMany(() => Event, event => event.calendar)
      events!: Event[];
      
      @CreateDateColumn()
      createdAt!: Date;
      
      @UpdateDateColumn()
      updatedAt!: Date;
  }