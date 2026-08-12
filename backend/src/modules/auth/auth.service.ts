import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import * as bcrypt from 'bcrypt';
  import { User, UserRole } from '../../database/entities/user.entity';
  import { LoginDto, RegisterDto } from './dto';
  
  export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
  }
  
  export interface AuthResponse {
    accessToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      studentId?: string;
    };
  }
  
  @Injectable()
  export class AuthService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    async login(dto: LoginDto): Promise<AuthResponse> {
      const user = await this.userRepository.findOne({
        where: { email: dto.email, isActive: true },
      });

      // Accounts created via Google have no passwordHash — bcrypt.compare
      // would throw on a null hash, so treat that the same as a wrong password.
      if (!user || !user.passwordHash) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Update last login
      await this.userRepository.update(user.id, { lastLoginAt: new Date() });

      return this.buildAuthResponse(user);
    }
  
    async register(dto: RegisterDto): Promise<AuthResponse> {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
  
      if (existing) {
        throw new ConflictException('An account with this email already exists');
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
        studentId: dto.studentId?.trim() || undefined,
        role: UserRole.STUDENT,
      });
  
      const saved = await this.userRepository.save(user);

      return this.buildAuthResponse(saved);
    }

    async validateOrCreateGoogleUser(profile: {
      googleId: string;
      email: string;
      firstName: string;
      lastName: string;
    }): Promise<User> {
      let user = await this.userRepository.findOne({
        where: { googleId: profile.googleId },
      });
      if (user) return user;

      // Same email registered via password first — link the Google identity
      // to that existing account rather than creating a duplicate.
      user = await this.userRepository.findOne({ where: { email: profile.email } });
      if (user) {
        await this.userRepository.update(user.id, { googleId: profile.googleId });
        return { ...user, googleId: profile.googleId };
      }

      const created = this.userRepository.create({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        googleId: profile.googleId,
        passwordHash: null,
        role: UserRole.STUDENT,
      });
      return this.userRepository.save(created);
    }

    issueTokenFor(user: User): AuthResponse {
      return this.buildAuthResponse(user);
    }

    private buildAuthResponse(user: User): AuthResponse {
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          studentId: user.studentId,
        },
      };
    }

    async getMe(userId: string): Promise<Omit<User, 'passwordHash'>> {
      const user = await this.userRepository.findOne({
        where: { id: userId, isActive: true },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const { passwordHash: _, ...result } = user;
      return result as Omit<User, 'passwordHash'>;
    }
  
    async validateUser(payload: JwtPayload): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });
  
      if (!user) {
        throw new UnauthorizedException('User no longer exists or is inactive');
      }
  
      return user;
    }
  }