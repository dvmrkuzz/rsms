import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    OneToMany
  } from 'typeorm';
  import { ServiceRequest } from './service-request.entity';
  import { AuditLog } from './audit-log.entity';
  import { VisitorLog } from './visitor-log.entity';
  import { Announcement } from './announcement.entity';
  
  export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    STUDENT = 'student',
  }
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ name: 'student_id', nullable: true, unique: true })
    studentId: string;
  
    @Column({ name: 'first_name' })
    firstName: string;
  
    @Column({ name: 'last_name' })
    lastName: string;
  
    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash', type: 'varchar', nullable: true })
    passwordHash: string | null;

    @Column({ name: 'google_id', type: 'varchar', nullable: true, unique: true })
    googleId: string | null;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;
  
    @Column({ name: 'is_active', default: true })
    isActive: boolean;
  
    @Column({ name: 'last_login_at', nullable: true })
    lastLoginAt: Date;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    @OneToMany(() => ServiceRequest, (req) => req.user)
    serviceRequests: ServiceRequest[];
  
    @OneToMany(() => AuditLog, (log) => log.user)
    auditLogs: AuditLog[];
  
    @OneToMany(() => VisitorLog, (log) => log.servedBy)
    visitorLogs: VisitorLog[];
  
    @OneToMany(() => Announcement, (a) => a.createdBy)
    announcements: Announcement[];
  }