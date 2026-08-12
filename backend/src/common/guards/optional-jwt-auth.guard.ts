import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Like JwtAuthGuard, but never rejects the request — an absent or invalid
// token just means req.user stays undefined instead of throwing 401. Lets a
// single route serve both guests and logged-in users.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    return user || undefined;
  }
}
