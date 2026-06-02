import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity('faqs')
  export class FAQ {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'text' })
    question: string;
  
    @Column({ type: 'text' })
    answer: string;
  
    @Column({ type: 'varchar', nullable: true })
    category?: string;
  
    @Column({ name: 'sort_order', default: 0 })
    sortOrder: number;
  
    @Column({ name: 'is_active', default: true })
    isActive: boolean;
  
    @Column({ name: 'created_by_id', nullable: true })
    createdById: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;
  }