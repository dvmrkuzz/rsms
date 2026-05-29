import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
  } from 'typeorm';
  import { User } from './user.entity';
  
  export enum AuditAction {
    CREATE   = 'create',
    UPDATE   = 'update',
    DELETE   = 'delete',
    LOGIN    = 'login',
    LOGOUT   = 'logout',
    APPROVE  = 'approve',
    REJECT   = 'reject',
    RELEASE  = 'release',
    EXPORT   = 'export',
  }
  
  @Entity('audit_logs')
  export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ name: 'user_id', nullable: true })
    userId: string;
  
    @Column({ type: 'enum', enum: AuditAction })
    action: AuditAction;
  
    @Column({ name: 'entity_name' })
    entityName: string;
  
    @Column({ name: 'entity_id', nullable: true })
    entityId: string;
  
    @Column({ name: 'old_value', type: 'jsonb', nullable: true })
    oldValue: Record<string, any>;
  
    @Column({ name: 'new_value', type: 'jsonb', nullable: true })
    newValue: Record<string, any>;
  
    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;
  
    @Column({ name: 'user_agent', nullable: true })
    userAgent: string;
  
    @Column({ nullable: true })
    description: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;
  }