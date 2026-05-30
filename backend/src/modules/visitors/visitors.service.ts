import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VisitorLog } from '../../database/entities/visitor-log.entity';
import { User } from '../../database/entities/user.entity';
import { CreateVisitorDto, CheckoutVisitorDto } from './dto';

@Injectable()
export class VisitorsService {
  constructor(
    @InjectRepository(VisitorLog)
    private readonly visitorRepository: Repository<VisitorLog>,
  ) {}

  async findAll(page = 1, limit = 10, date?: string) {
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

  async checkin(dto: CreateVisitorDto, staff?: User): Promise<VisitorLog> {
    const visitor = this.visitorRepository.create({
      visitorName: dto.visitorName,
      contactNumber: dto.contactNumber,
      studentId: dto.studentId,
      purpose: dto.purpose,
      purposeDetails: dto.purposeDetails,
      notes: dto.notes,
      servedById: staff?.id,
      timeIn: new Date(),
    });
    return this.visitorRepository.save(visitor);
  }

  async checkout(id: string, dto: CheckoutVisitorDto): Promise<VisitorLog> {
    const visitor = await this.findOne(id);
    if (visitor.timeOut) {
      throw new NotFoundException('Visitor has already checked out');
    }
    await this.visitorRepository.update(id, {
      timeOut: new Date(),
      ...(dto.notes && { notes: dto.notes }),
    });
    return this.findOne(id);
  }

  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, stillInside] = await Promise.all([
      this.visitorRepository.count({
        where: { timeIn: Between(today, tomorrow) },
      }),
      this.visitorRepository.count({
        where: {
          timeIn: Between(today, tomorrow),
          timeOut: undefined,
        },
      }),
    ]);

    return { totalToday: total, currentlyInside: stillInside };
  }
}