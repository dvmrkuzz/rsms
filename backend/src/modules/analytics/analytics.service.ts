import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ServiceRequest, RequestStatus } from '../../database/entities/service-request.entity';
import { VisitorLog } from '../../database/entities/visitor-log.entity';
import { DocumentType } from '../../database/entities/document-type.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly requestRepository: Repository<ServiceRequest>,
    @InjectRepository(VisitorLog)
    private readonly visitorRepository: Repository<VisitorLog>,
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getFullAnalytics() {
    const [
      requestStats,
      documentStats,
      visitorStats,
      peakDays,
      monthlyTrend,
      userStats,
    ] = await Promise.all([
      this.getRequestStats(),
      this.getDocumentStats(),
      this.getVisitorStats(),
      this.getPeakDays(),
      this.getMonthlyTrend(),
      this.getUserStats(),
    ]);

    return {
      requestStats,
      documentStats,
      visitorStats,
      peakDays,
      monthlyTrend,
      userStats,
      generatedAt: new Date().toISOString(),
    };
  }

  async getRequestStats() {
    const total = await this.requestRepository.count();
    const pending = await this.requestRepository.count({ where: { status: RequestStatus.PENDING } });
    const processing = await this.requestRepository.count({ where: { status: RequestStatus.PROCESSING } });
    const ready = await this.requestRepository.count({ where: { status: RequestStatus.READY_FOR_PICKUP } });
    const released = await this.requestRepository.count({ where: { status: RequestStatus.RELEASED } });
    const cancelled = await this.requestRepository.count({ where: { status: RequestStatus.CANCELLED } });
    const rejected = await this.requestRepository.count({ where: { status: RequestStatus.REJECTED } });

    const completionRate = total > 0 ? Math.round((released / total) * 100) : 0;
    const pendingRate = total > 0 ? Math.round(((pending + processing) / total) * 100) : 0;

    return {
      total,
      byStatus: { pending, processing, ready, released, cancelled, rejected },
      completionRate,
      pendingRate,
    };
  }

  async getDocumentStats() {
    const requests = await this.requestRepository.find({
      relations: { documentType: true },
    });

    const countMap: Record<string, { name: string; count: number; released: number }> = {};

    for (const req of requests) {
      if (!req.documentType) continue;
      const key = req.documentTypeId;
      if (!countMap[key]) {
        countMap[key] = { name: req.documentType.name, count: 0, released: 0 };
      }
      countMap[key].count++;
      if (req.status === RequestStatus.RELEASED) {
        countMap[key].released++;
      }
    }

    const sorted = Object.values(countMap).sort((a, b) => b.count - a.count);
    return sorted;
  }

  async getVisitorStats() {
    const total = await this.visitorRepository.count();

    const purposeGroups = await this.visitorRepository
      .createQueryBuilder('v')
      .select('v.purpose', 'purpose')
      .addSelect('COUNT(*)', 'count')
      .groupBy('v.purpose')
      .getRawMany();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await this.visitorRepository.count({
      where: { timeIn: Between(today, tomorrow) },
    });

    return {
      total,
      today: todayCount,
      byPurpose: purposeGroups.map(p => ({
        purpose: p.purpose,
        count: parseInt(p.count),
      })),
    };
  }

  async getPeakDays() {
    const requests = await this.requestRepository.find({
      order: { requestedAt: 'ASC' },
    });
  
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts: Record<string, number> = {};
    dayNames.forEach(d => dayCounts[d] = 0);
  
    for (const req of requests) {
      const day = dayNames[new Date(req.requestedAt).getDay()];
      dayCounts[day]++;
    }
  
    const sorted = Object.entries(dayCounts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count);
  
    return sorted;
  }

  async getMonthlyTrend() {
    const requests = await this.requestRepository.find({
      order: { requestedAt: 'ASC' },
    });
  
    const monthMap: Record<string, { month: string; requests: number; released: number }> = {};
  
    for (const req of requests) {
      const date = new Date(req.requestedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  
      if (!monthMap[key]) {
        monthMap[key] = { month: label, requests: 0, released: 0 };
      }
      monthMap[key].requests++;
      if (req.status === RequestStatus.RELEASED) {
        monthMap[key].released++;
      }
    }
  
    return Object.values(monthMap).slice(-6);
  }

  async getUserStats() {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { isActive: true } });
    const students = await this.userRepository.count({ where: { role: 'student' as any } });
    const staff = await this.userRepository.count({ where: { role: 'staff' as any } });
    const admins = await this.userRepository.count({ where: { role: 'admin' as any } });

    return { total, active, students, staff, admins };
  }
}