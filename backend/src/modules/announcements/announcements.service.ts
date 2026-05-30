import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Or, IsNull } from 'typeorm';
import {
  Announcement,
  AnnouncementTarget,
} from '../../database/entities/announcement.entity';
import { User } from '../../database/entities/user.entity';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async findAll(page = 1, limit = 10, target?: AnnouncementTarget) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (target) where.target = target;

    const [announcements, total] = await this.announcementRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { createdBy: true },
    });

    return {
      data: announcements.map((a) => ({
        ...a,
        createdBy: a.createdBy
          ? {
              id: a.createdBy.id,
              firstName: a.createdBy.firstName,
              lastName: a.createdBy.lastName,
            }
          : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findActive(target?: AnnouncementTarget) {
    const now = new Date();
    const where: any = {
      isActive: true,
    };
    if (target) where.target = target;

    const announcements = await this.announcementRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return announcements.filter(
      (a) => !a.expiresAt || new Date(a.expiresAt) > now,
    );
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  async create(dto: CreateAnnouncementDto, user: User): Promise<Announcement> {
    const announcement = this.announcementRepository.create({
      title: dto.title,
      content: dto.content,
      target: dto.target,
      createdById: user.id,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
    return this.announcementRepository.save(announcement);
  }

  async update(id: string, dto: UpdateAnnouncementDto): Promise<Announcement> {
    const announcement = await this.findOne(id);
    await this.announcementRepository.update(id, {
      ...(dto.title && { title: dto.title }),
      ...(dto.content && { content: dto.content }),
      ...(dto.target && { target: dto.target }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.expiresAt && { expiresAt: new Date(dto.expiresAt) }),
    });
    return this.findOne(id);
  }

  async deactivate(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.announcementRepository.update(id, { isActive: false });
    return { message: 'Announcement deactivated' };
  }
}