// tag.entity.ts
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
    JoinTable,
} from 'typeorm';

import { Event } from './event.entity';

@Entity()
@Unique(['id'])
export class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;
    
    @Column({ default: '#6c757d' })
    color!: string;
    
    @Column({ nullable: true })
    description?: string;
    
    @ManyToMany(() => Event, event => event.tags)
    @JoinTable()
    events!: Event[];
    
    @CreateDateColumn()
    createdAt!: Date;
    
    @UpdateDateColumn()
    updatedAt!: Date;
}