import {
    Injectable, NotFoundException,
    BadRequestException, ForbiddenException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import {
    ServiceRequest,
    RequestStatus,
  } from '../../database/entities/service-request.entity';
  import { DocumentType } from '../../database/entities/document-type.entity';
  import { User, UserRole } from '../../database/entities/user.entity';
  import { CreateServiceRequestDto, UpdateStatusDto } from './dto';
  import { AuditService } from '../audit/audit.service';
  import { AuditAction } from '../../database/entities/audit-log.entity';
  
  @Injectable()
  export class ServicesService {
    constructor(
      @InjectRepository(ServiceRequest)
      private readonly requestRepository: Repository<ServiceRequest>,
      @InjectRepository(DocumentType)
      private readonly documentTypeRepository: Repository<DocumentType>,
      private readonly auditService: AuditService,
    ) {}
  
    private generateTrackingNumber(): string {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 9000 + 1000);
      return `RSMS-${year}${month}${day}-${random}`;
    }
  
    private sanitizeRequest(request: ServiceRequest): any {
      const { user, ...rest } = request;
      return {
        ...rest,
        user: user
          ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              studentId: user.studentId,
              role: user.role,
            }
          : null,
      };
    }
  
    async findAll(
      page = 1,
      limit = 10,
      status?: RequestStatus,
      userId?: string,
    ) {
      const skip = (page - 1) * limit;
      const where: any = {};
      if (status) where.status = status;
      if (userId) where.userId = userId;
  
      const [requests, total] = await this.requestRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { requestedAt: 'DESC' },
        relations: { user: true, documentType: true },
      });
  
      return {
        data: requests.map((r) => this.sanitizeRequest(r)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    async findOne(id: string): Promise<any> {
      const request = await this.requestRepository.findOne({
        where: { id },
        relations: { user: true, documentType: true },
      });
      if (!request) throw new NotFoundException('Service request not found');
      return this.sanitizeRequest(request);
    }
  
    async findByTracking(trackingNumber: string): Promise<any> {
      const request = await this.requestRepository.findOne({
        where: { trackingNumber },
        relations: { user: true, documentType: true },
      });
      if (!request) throw new NotFoundException('Tracking number not found');
      return this.sanitizeRequest(request);
    }
  
    async findMyRequests(userId: string, page = 1, limit = 10) {
      return this.findAll(page, limit, undefined, userId);
    }
  
    async create(
      dto: CreateServiceRequestDto,
      user: User,
    ): Promise<any> {
      const documentType = await this.documentTypeRepository.findOne({
        where: { id: dto.documentTypeId, isActive: true },
      });
  
      if (!documentType) {
        throw new NotFoundException('Document type not found or unavailable');
      }
  
      const trackingNumber = this.generateTrackingNumber();
  
      const request = this.requestRepository.create({
        userId: user.id,
        documentTypeId: dto.documentTypeId,
        purpose: dto.purpose,
        copies: dto.copies,
        remarks: dto.remarks,
        trackingNumber,
        status: RequestStatus.PENDING,
      });
  
      const saved = await this.requestRepository.save(request);
  
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.CREATE,
        entityName: 'service_requests',
        entityId: saved.id,
        newValue: {
          trackingNumber,
          documentType: documentType.name,
          copies: dto.copies,
        },
        description: `New service request created: ${trackingNumber}`,
      });
  
      return saved;
    }
  
    async updateStatus(
      id: string,
      dto: UpdateStatusDto,
      staff: User,
    ): Promise<any> {
      const request = await this.requestRepository.findOne({
        where: { id },
        relations: { user: true, documentType: true },
      });
      if (!request) throw new NotFoundException('Service request not found');
  
      this.validateStatusTransition(request.status, dto.status);
  
      const oldStatus = request.status;
  
      const updateData: Partial<ServiceRequest> = {
        status: dto.status,
        ...(dto.remarks && { remarks: dto.remarks }),
        ...(dto.rejectionReason && { rejectionReason: dto.rejectionReason }),
        ...(dto.status === RequestStatus.RELEASED && {
          completedAt: new Date(),
        }),
      };
  
      await this.requestRepository.update(id, updateData);
  
      const auditActionMap: Partial<Record<RequestStatus, AuditAction>> = {
        [RequestStatus.RELEASED]: AuditAction.RELEASE,
        [RequestStatus.REJECTED]: AuditAction.REJECT,
        [RequestStatus.PROCESSING]: AuditAction.APPROVE,
      };
  
      await this.auditService.log({
        userId: staff.id,
        action: auditActionMap[dto.status] ?? AuditAction.UPDATE,
        entityName: 'service_requests',
        entityId: id,
        oldValue: { status: oldStatus },
        newValue: { status: dto.status, remarks: dto.remarks },
        description: `Request ${request.trackingNumber} status: ${oldStatus} → ${dto.status}`,
      });
  
      return this.findOne(id);
    }
  
    async cancel(id: string, user: User): Promise<any> {
      const request = await this.requestRepository.findOne({
        where: { id },
      });
      if (!request) throw new NotFoundException('Service request not found');
  
      if (request.userId !== user.id && user.role === UserRole.STUDENT) {
        throw new ForbiddenException('You can only cancel your own requests');
      }
  
      if (![RequestStatus.PENDING, RequestStatus.PROCESSING].includes(request.status)) {
        throw new BadRequestException(
          'Only pending or processing requests can be cancelled',
        );
      }
  
      await this.requestRepository.update(id, {
        status: RequestStatus.CANCELLED,
      });
  
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.UPDATE,
        entityName: 'service_requests',
        entityId: id,
        oldValue: { status: request.status },
        newValue: { status: RequestStatus.CANCELLED },
        description: `Request ${request.trackingNumber} cancelled`,
      });
  
      return this.findOne(id);
    }
  
    private validateStatusTransition(
      current: RequestStatus,
      next: RequestStatus,
    ): void {
      const validTransitions: Record<RequestStatus, RequestStatus[]> = {
        [RequestStatus.PENDING]: [
          RequestStatus.PROCESSING,
          RequestStatus.REJECTED,
          RequestStatus.CANCELLED,
        ],
        [RequestStatus.PROCESSING]: [
          RequestStatus.READY,
          RequestStatus.REJECTED,
          RequestStatus.CANCELLED,
        ],
        [RequestStatus.READY]: [RequestStatus.RELEASED],
        [RequestStatus.RELEASED]: [],
        [RequestStatus.CANCELLED]: [],
        [RequestStatus.REJECTED]: [],
      };
  
      if (!validTransitions[current].includes(next)) {
        throw new BadRequestException(
          `Cannot transition from "${current}" to "${next}"`,
        );
      }
    }
  }