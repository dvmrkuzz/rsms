import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn,
  } from 'typeorm';
  import { User } from './user.entity';

  export enum InquiryInterface {
    KIOSK     = 'kiosk',
    DASHBOARD = 'dashboard',
    ASKSORSU  = 'asksorsu',
  }

  @Entity('inquiries')
  export class Inquiry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'session_id' })
    sessionId: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;

    @Column({ type: 'text' })
    question: string;
  
    @Column({ type: 'text', nullable: true })
    answer: string;
  
    @Column({
      type: 'enum',
      enum: InquiryInterface,
      default: InquiryInterface.ASKSORSU,
    })
    interface: InquiryInterface;
  
    @Column({ name: 'is_helpful', nullable: true })
    isHelpful: boolean;
  
    @Column({ name: 'feedback_note', nullable: true })
    feedbackNote: string;
  
    @CreateDateColumn({ name: 'asked_at' })
    askedAt: Date;
  }