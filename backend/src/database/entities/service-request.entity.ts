import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn
  } from 'typeorm';
  import { User } from './user.entity';
  import { DocumentType } from './document-type.entity';

  export enum RequestStatus {
    PENDING           = 'pending',
    PROCESSING        = 'processing',
    FORWARDED_TO_MAIN = 'forwarded_to_main',
    READY_FOR_PICKUP  = 'ready_for_pickup',
    RELEASED          = 'released',
    CANCELLED         = 'cancelled',
    REJECTED          = 'rejected',
  }

  @Entity('service_requests')
  export class ServiceRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', nullable: true })
    userId: string | null;

    @Column({ name: 'document_type_id' })
    documentTypeId: string;

    @Column({
      type: 'enum',
      enum: RequestStatus,
      default: RequestStatus.PENDING,
    })
    status: RequestStatus;

    @Column({ nullable: true })
    purpose: string;

    @Column({ default: 1 })
    copies: number;

    @Column({ nullable: true })
    remarks: string;

    @Column({ name: 'rejection_reason', nullable: true })
    rejectionReason: string;

    @Column({ name: 'tracking_number', unique: true, nullable: true })
    trackingNumber: string;

    @CreateDateColumn({ name: 'requested_at' })
    requestedAt: Date;

    @Column({ name: 'completed_at', nullable: true })
    completedAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.serviceRequests, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;

    @ManyToOne(() => DocumentType, (dt) => dt.serviceRequests)
    @JoinColumn({ name: 'document_type_id' })
    documentType: DocumentType;
  }