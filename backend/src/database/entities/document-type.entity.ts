import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    OneToMany
  } from 'typeorm';
  import { ServiceRequest } from './service-request.entity';
  
  @Entity('document_types')
  export class DocumentType {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    name: string;
  
    @Column({ nullable: true })
    description: string;
  
    @Column({ name: 'processing_days', default: 3 })
    processingDays: number;
  
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    fee: number;
  
    @Column({ name: 'requires_clearance', default: false })
    requiresClearance: boolean;
  
    @Column({ name: 'is_active', default: true })
    isActive: boolean;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    @OneToMany(() => ServiceRequest, (req) => req.documentType)
    serviceRequests: ServiceRequest[];
  }