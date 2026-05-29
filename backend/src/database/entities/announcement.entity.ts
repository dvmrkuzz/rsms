import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn
  } from 'typeorm';
  import { User } from './user.entity';
  
  export enum AnnouncementTarget {
    ALL       = 'all',
    STUDENTS  = 'students',
    STAFF     = 'staff',
    KIOSK     = 'kiosk',
  }
  
  @Entity('announcements')
  export class Announcement {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ name: 'created_by_id' })
    createdById: string;
  
    @Column()
    title: string;
  
    @Column({ type: 'text' })
    content: string;
  
    @Column({
      type: 'enum',
      enum: AnnouncementTarget,
      default: AnnouncementTarget.ALL,
    })
    target: AnnouncementTarget;
  
    @Column({ name: 'is_active', default: true })
    isActive: boolean;
  
    @Column({ name: 'expires_at', nullable: true })
    expiresAt: Date;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    @ManyToOne(() => User, (user) => user.announcements)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;
  }