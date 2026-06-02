import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { FAQ } from '../../database/entities/faq.entity';
import { User } from '../../database/entities/user.entity';
import { CreateFaqDto, UpdateFaqDto } from './dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(FAQ)
    private readonly faqRepository: Repository<FAQ>,
  ) {}

  async findAll(search?: string, category?: string): Promise<FAQ[]> {
    const where: any = { isActive: true };
    if (category) where.category = category;
  
    const faqs = await this.faqRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  
    if (search) {
      const lower = search.toLowerCase();
      return faqs.filter(f =>
        f.question.toLowerCase().includes(lower) ||
        f.answer.toLowerCase().includes(lower)
      );
    }
  
    return faqs;
  }

  async findAllAdmin(search?: string, category?: string): Promise<any[]> {
    const where: any = {};
    if (category) where.category = category;
  
    const faqs = await this.faqRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
      relations: { createdBy: true },
    });
  
    const filtered = search
      ? faqs.filter(f => {
          const lower = search.toLowerCase();
          return (
            f.question.toLowerCase().includes(lower) ||
            f.answer.toLowerCase().includes(lower)
          );
        })
      : faqs;
  
    return filtered.map(f => ({
      ...f,
      createdBy: f.createdBy
        ? {
            id: f.createdBy.id,
            firstName: f.createdBy.firstName,
            lastName: f.createdBy.lastName,
          }
        : null,
    }));
  }

  async findCategories(): Promise<string[]> {
    const faqs = await this.faqRepository.find({
      where: { isActive: true },
    });
    const cats = [...new Set(faqs.map(f => f.category).filter(Boolean))] as string[];
    return cats.sort();
  }

  async findOne(id: string): Promise<FAQ> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async create(dto: CreateFaqDto, user: User): Promise<FAQ> {
    const faq = this.faqRepository.create({
      question: dto.question,
      answer: dto.answer,
      category: dto.category ?? undefined,
      sortOrder: dto.sortOrder ?? 0,
      createdById: user?.id ?? undefined,
    });
    return this.faqRepository.save(faq);
  }

  async update(id: string, dto: UpdateFaqDto): Promise<FAQ> {
    await this.findOne(id);
    await this.faqRepository.update(id, {
      ...(dto.question && { question: dto.question }),
      ...(dto.answer && { answer: dto.answer }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.faqRepository.delete(id);
    return { message: 'FAQ deleted successfully' };
  }

  async getStats() {
    const total = await this.faqRepository.count();
    const active = await this.faqRepository.count({ where: { isActive: true } });
    const categories = await this.findCategories();
    return { total, active, inactive: total - active, categories: categories.length };
  }
}