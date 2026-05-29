import {
    Injectable, NotFoundException,
    ConflictException, ForbiddenException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, ILike } from 'typeorm';
  import { ConfigService } from '@nestjs/config';
  import * as bcrypt from 'bcrypt';
  import { User, UserRole } from '../../database/entities/user.entity';
  import { CreateUserDto, UpdateUserDto, ChangeRoleDto } from './dto';
  
  export interface PaginatedUsers {
    data: Omit<User, 'passwordHash'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  @Injectable()
  export class UsersService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly configService: ConfigService,
    ) {}
  
    async findAll(
      page = 1,
      limit = 10,
      role?: UserRole,
      search?: string,
    ): Promise<PaginatedUsers> {
      const skip = (page - 1) * limit;
  
      const where: any = {};
      if (role) where.role = role;
      if (search) {
        const [byFirst, byLast, byEmail] = await Promise.all([
          this.userRepository.findAndCount({
            where: { firstName: ILike(`%${search}%`), ...( role ? { role } : {}) },
            skip, take: limit,
            order: { createdAt: 'DESC' },
          }),
          this.userRepository.findAndCount({
            where: { lastName: ILike(`%${search}%`), ...( role ? { role } : {}) },
            skip, take: limit,
            order: { createdAt: 'DESC' },
          }),
          this.userRepository.findAndCount({
            where: { email: ILike(`%${search}%`), ...( role ? { role } : {}) },
            skip, take: limit,
            order: { createdAt: 'DESC' },
          }),
        ]);
  
        const combined = [
          ...byFirst[0], ...byLast[0], ...byEmail[0],
        ];
        const unique = Array.from(
          new Map(combined.map((u) => [u.id, u])).values(),
        );
  
        return {
          data: unique.map(({ passwordHash: _, ...u }) => u as Omit<User, 'passwordHash'>),
          total: unique.length,
          page,
          limit,
          totalPages: Math.ceil(unique.length / limit),
        };
      }
  
      const [users, total] = await this.userRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
  
      return {
        data: users.map(({ passwordHash: _, ...u }) => u as Omit<User, 'passwordHash'>),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    async findOne(id: string): Promise<Omit<User, 'passwordHash'>> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
      const { passwordHash: _, ...result } = user;
      return result as Omit<User, 'passwordHash'>;
    }
  
    async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('A user with this email already exists');
      }
  
      if (dto.studentId) {
        const existingStudent = await this.userRepository.findOne({
          where: { studentId: dto.studentId },
        });
        if (existingStudent) {
          throw new ConflictException('This student ID is already registered');
        }
      }
  
      const rounds = this.configService.get<number>('bcrypt.rounds') ?? 12;
      const passwordHash = await bcrypt.hash(dto.password, rounds);
  
      const user = this.userRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        role: dto.role,
        studentId: dto.studentId?.trim() || undefined,
      });
  
      const saved = await this.userRepository.save(user);
      const { passwordHash: _, ...result } = saved;
      return result as Omit<User, 'passwordHash'>;
    }
  
    async update(
      id: string,
      dto: UpdateUserDto,
    ): Promise<Omit<User, 'passwordHash'>> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
  
      if (dto.email && dto.email !== user.email) {
        const existing = await this.userRepository.findOne({
          where: { email: dto.email },
        });
        if (existing) {
          throw new ConflictException('Email is already in use');
        }
      }
  
      await this.userRepository.update(id, {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.email && { email: dto.email }),
        ...(dto.studentId !== undefined && {
          studentId: dto.studentId?.trim() || undefined,
        }),
      });
  
      return this.findOne(id);
    }
  
    async changeRole(
      id: string,
      dto: ChangeRoleDto,
      requestingUser: User,
    ): Promise<Omit<User, 'passwordHash'>> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
  
      if (id === requestingUser.id) {
        throw new ForbiddenException('You cannot change your own role');
      }
  
      await this.userRepository.update(id, { role: dto.role });
      return this.findOne(id);
    }
  
    async deactivate(
      id: string,
      requestingUser: User,
    ): Promise<{ message: string }> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
  
      if (id === requestingUser.id) {
        throw new ForbiddenException('You cannot deactivate your own account');
      }
  
      await this.userRepository.update(id, { isActive: false });
      return { message: 'User account deactivated successfully' };
    }
  
    async reactivate(id: string): Promise<{ message: string }> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
      await this.userRepository.update(id, { isActive: true });
      return { message: 'User account reactivated successfully' };
    }
  }