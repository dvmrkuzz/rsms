import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './database/entities/user.entity';
import { DocumentType } from './database/entities/document-type.entity';
import { ServiceRequest } from './database/entities/service-request.entity';
import { VisitorLog } from './database/entities/visitor-log.entity';
import { AuditLog } from './database/entities/audit-log.entity';
import { Inquiry } from './database/entities/inquiry.entity';
import { Announcement } from './database/entities/announcement.entity';
import { FAQ } from './database/entities/faq.entity';
config();

const entities = [
  User, DocumentType, ServiceRequest,
  VisitorLog, AuditLog, Inquiry, Announcement, FAQ,
];

const migrations = ['src/database/migrations/*{.ts,.js}'];

// If DATABASE_URL is set (Railway / production), use the single connection
// string with SSL. Otherwise fall back to the separate local dev variables.
export const AppDataSource = process.env.DATABASE_URL
  ? new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities,
      migrations,
      synchronize: false,
    })
  : new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? '',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'rsms_db',
      entities,
      migrations,
      synchronize: false,
    });