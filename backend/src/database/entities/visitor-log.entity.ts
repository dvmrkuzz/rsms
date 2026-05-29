import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
  } from 'typeorm';
  import { User } from './user.entity';
  
  export enum VisitorPurpose {
    INQUIRY        = 'inquiry',
    DOCUMENT_REQUEST = 'document_request',
    FOLLOW_UP      = 'follow_up',
    CONSULTATION   = 'consultation',
    OTHER          = 'other',
  }
  
  @Entity('visitor_logs')
  export class VisitorLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ name: 'visitor_name' })
    visitorName: string;
  
    @Column({ name: 'contact_number', nullable: true })
    contactNumber: string;
  
    @Column({ name: 'student_id', nullable: true })
    studentId: string;
  
    @Column({
      type: 'enum',
      enum: VisitorPurpose,
      default: VisitorPurpose.INQUIRY,
    })
    purpose: VisitorPurpose;
  
    @Column({ name: 'purpose_details', nullable: true })
    purposeDetails: string;
  
    @Column({ name: 'served_by_id', nullable: true })
    servedById: string;
  
    @Column({ name: 'time_in' })
    timeIn: Date;
  
    @Column({ name: 'time_out', nullable: true })
    timeOut: Date;
  
    @Column({ nullable: true })
    notes: string;
  
    @ManyToOne(() => User, (user) => user.visitorLogs, { nullable: true })
    @JoinColumn({ name: 'served_by_id' })
    servedBy: User;
  }