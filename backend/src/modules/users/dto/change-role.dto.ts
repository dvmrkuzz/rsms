import { IsEnum } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class ChangeRoleDto {
  @IsEnum(UserRole, { message: 'Role must be admin, staff, or student' })
  role: UserRole;
}