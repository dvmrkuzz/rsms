import {
    Controller, Get, Post, Patch, Body,
    Param, Query, UseGuards, ParseUUIDPipe,
    ParseIntPipe, DefaultValuePipe,
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { CreateUserDto, UpdateUserDto, ChangeRoleDto } from './dto';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../../common/guards/roles.guard';
  import { Roles } from '../../common/decorators/roles.decorator';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { UserRole, User } from '../../database/entities/user.entity';
  
  @Controller('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Get()
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('role') role?: UserRole,
      @Query('search') search?: string,
    ) {
      return this.usersService.findAll(page, limit, role, search);
    }
  
    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.usersService.findOne(id);
    }
  
    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() dto: CreateUserDto) {
      return this.usersService.create(dto);
    }
  
    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateUserDto,
    ) {
      return this.usersService.update(id, dto);
    }
  
    @Patch(':id/role')
    @Roles(UserRole.ADMIN)
    changeRole(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: ChangeRoleDto,
      @CurrentUser() user: User,
    ) {
      return this.usersService.changeRole(id, dto, user);
    }
  
    @Patch(':id/deactivate')
    @Roles(UserRole.ADMIN)
    deactivate(
      @Param('id', ParseUUIDPipe) id: string,
      @CurrentUser() user: User,
    ) {
      return this.usersService.deactivate(id, user);
    }
  
    @Patch(':id/reactivate')
    @Roles(UserRole.ADMIN)
    reactivate(@Param('id', ParseUUIDPipe) id: string) {
      return this.usersService.reactivate(id);
    }
  }