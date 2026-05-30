import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn
  } from 'typeorm';
  
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
  
    @Column({ type: 'text' })
    question: string;
  
    @Column({ type: 'text', nullable: true })
    answer: string | null;
  
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