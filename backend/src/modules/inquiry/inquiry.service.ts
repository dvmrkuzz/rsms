import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from '../../database/entities/inquiry.entity';
import { CreateInquiryDto, FeedbackDto } from './dto';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [inquiries, total] = await this.inquiryRepository.findAndCount({
      skip,
      take: limit,
      order: { askedAt: 'DESC' },
    });
    return {
      data: inquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySession(sessionId: string): Promise<Inquiry[]> {
    return this.inquiryRepository.find({
      where: { sessionId },
      order: { askedAt: 'ASC' },
    });
  }

  async create(dto: CreateInquiryDto): Promise<Inquiry> {
    const inquiry = this.inquiryRepository.create({
      sessionId: dto.sessionId,
      question: dto.question,
      interface: dto.interface,
    });
    return this.inquiryRepository.save(inquiry);
  }

  async saveAnswer(id: string, answer: string): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    await this.inquiryRepository.update(id, { answer });
    return this.inquiryRepository.findOne({ where: { id } }) as Promise<Inquiry>;
  }

  async submitFeedback(id: string, dto: FeedbackDto): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    await this.inquiryRepository.update(id, {
      isHelpful: dto.isHelpful,
      feedbackNote: dto.feedbackNote,
    });
    return this.inquiryRepository.findOne({ where: { id } }) as Promise<Inquiry>;
  }

  async getStats() {
    const total = await this.inquiryRepository.count();
    const helpful = await this.inquiryRepository.count({
      where: { isHelpful: true },
    });
    const notHelpful = await this.inquiryRepository.count({
      where: { isHelpful: false },
    });
    return { total, helpful, notHelpful };
  }
}