import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { DocumentType } from './document-type.entity';

export enum VisitorPurpose {
  DOCUMENT_REQUEST = 'document_request',
  PICK_UP = 'pick_up',
}

export enum VisitorType {
  STUDENT = 'student',
  ALUMNI = 'alumni',
  NON_STUDENT = 'non_student',
}

@Entity('visitor_logs')
export class VisitorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'queue_number' })
  queueNumber: string;

  @Column({ name: 'visitor_name' })
  visitorName: string;

  @Column({ name: 'contact_number', nullable: true })
  contactNumber: string;

  @Column({ name: 'student_id', nullable: true })
  studentId: string;

  @Column({
    type: 'enum',
    enum: VisitorPurpose,
    default: VisitorPurpose.DOCUMENT_REQUEST,
  })
  purpose: VisitorPurpose;

  @Column({
    name: 'visitor_type',
    type: 'enum',
    enum: VisitorType,
    default: VisitorType.NON_STUDENT,
  })
  visitorType: VisitorType;

  @Column({ name: 'document_type_id', nullable: true })
  documentTypeId: string | null;

  @Column({ name: 'tracking_number', nullable: true })
  trackingNumber: string;

  @Column({ name: 'served_by_id', nullable: true })
  servedById: string;

  @Column({ name: 'time_in' })
  timeIn: Date;

  @Column({ name: 'time_out', nullable: true })
  timeOut: Date;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'is_served', default: false })
  isServed: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'served_by_id' })
  servedBy: User;

  @ManyToOne(() => DocumentType, { nullable: true })
  @JoinColumn({ name: 'document_type_id' })
  documentType: DocumentType | null;
}