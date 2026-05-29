import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './database/entities/user.entity';
import { DocumentType } from './database/entities/document-type.entity';
import { ServiceRequest } from './database/entities/service-request.entity';
import { VisitorLog } from './database/entities/visitor-log.entity';
import { AuditLog } from './database/entities/audit-log.entity';
import { Inquiry } from './database/entities/inquiry.entity';
import { Announcement } from './database/entities/announcement.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? '',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'rsms_db',
  entities: [
    User, DocumentType, ServiceRequest,
    VisitorLog, AuditLog, Inquiry, Announcement,
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});