import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VisitorLog, VisitorType } from '../../database/entities/visitor-log.entity';
import { ServiceRequest, RequestStatus } from '../../database/entities/service-request.entity';
import { DocumentType } from '../../database/entities/document-type.entity';

@Injectable()
export class VisitorsService {
  constructor(
    @InjectRepository(VisitorLog)
    private readonly visitorRepository: Repository<VisitorLog>,
    @InjectRepository(ServiceRequest)
    private readonly requestRepository: Repository<ServiceRequest>,
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
  ) {}

  private async generateQueueNumber(): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.visitorRepository.count({
      where: { timeIn: Between(today, tomorrow) },
    });

    const number = String(count + 1).padStart(3, '0');
    return `Q-${number}`;
  }

  private generateTrackingNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `RSMS-${year}${month}${day}-${random}`;
  }

  async kioskCheckin(dto: {
    visitorName: string;
    contactNumber?: string;
    studentId?: string;
    purpose: string;
    visitorType?: string;
    documentTypeId?: string;
    notes?: string;
  }): Promise<any> {
    const queueNumber = await this.generateQueueNumber();
    let trackingNumber: string | undefined = undefined;

    if (dto.purpose === 'document_request' && dto.documentTypeId) {
      const docType = await this.documentTypeRepository.findOne({
        where: { id: dto.documentTypeId, isActive: true },
      });

      if (docType) {
        trackingNumber = this.generateTrackingNumber();

        const serviceRequest = this.requestRepository.create({
          documentTypeId: dto.documentTypeId,
          status: RequestStatus.PENDING,
          copies: 1,
          purpose: 'Walk-in kiosk request',
          trackingNumber,
          remarks: dto.notes,
        });

        await this.requestRepository.save(serviceRequest);
      }
    }

    const validVisitorTypes = Object.values(VisitorType) as string[];
    const visitorType =
      dto.visitorType && validVisitorTypes.includes(dto.visitorType)
        ? (dto.visitorType as VisitorType)
        : VisitorType.NON_STUDENT;

    const visitor = this.visitorRepository.create({
      queueNumber,
      visitorName: dto.visitorName,
      contactNumber: dto.contactNumber,
      studentId: dto.studentId,
      purpose: dto.purpose as any,
      visitorType,
      documentTypeId: dto.documentTypeId,
      trackingNumber,
      timeIn: new Date(),
      isServed: false,
    });

    await this.visitorRepository.save(visitor);

    return {
      queueNumber,
      trackingNumber: trackingNumber ?? null,
      visitorName: dto.visitorName,
      purpose: dto.purpose,
      visitorType,
      message: dto.purpose === 'document_request'
        ? 'Your request has been submitted. Please wait for your queue number to be called.'
        : 'Please wait for your queue number to be called.',
    };
  }

  async findAll(page = 1, limit = 20, date?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.timeIn = Between(start, end);
    }

    const [visitors, total] = await this.visitorRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { timeIn: 'DESC' },
      relations: { servedBy: true },
    });

    return {
      data: visitors.map((v) => ({
        ...v,
        servedBy: v.servedBy
          ? {
              id: v.servedBy.id,
              firstName: v.servedBy.firstName,
              lastName: v.servedBy.lastName,
            }
          : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<VisitorLog> {
    const visitor = await this.visitorRepository.findOne({
      where: { id },
      relations: { servedBy: true },
    });
    if (!visitor) throw new NotFoundException('Visitor log not found');
    return visitor;
  }

  async markServed(id: string, staffId: string): Promise<VisitorLog> {
    await this.visitorRepository.update(id, {
      isServed: true,
      servedById: staffId,
      timeOut: new Date(),
    });
    return this.findOne(id);
  }

  async getTodayQueue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const visitors = await this.visitorRepository.find({
      where: { timeIn: Between(today, tomorrow) },
      order: { timeIn: 'ASC' },
      relations: { documentType: true },
    });

    return {
      queue: visitors.map((v) => ({
        ...v,
        documentTypeName: v.documentType?.name ?? null,
        documentType: undefined,
      })),
      total: visitors.length,
      waiting: visitors.filter(v => !v.isServed).length,
      served: visitors.filter(v => v.isServed).length,
    };
  }

  async getPublicDocumentTypes() {
    return this.documentTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const total = await this.visitorRepository.count({
      where: { timeIn: Between(today, tomorrow) },
    });

    const stillWaiting = await this.visitorRepository
      .createQueryBuilder('v')
      .where('v.time_in BETWEEN :start AND :end', { start: today, end: tomorrow })
      .andWhere('v.is_served = false')
      .getCount();

    return { totalToday: total, currentlyInside: stillWaiting };
  }
}