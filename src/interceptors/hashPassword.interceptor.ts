import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, map } from "rxjs";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashPasswordInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const password = request.body.password || request.body.newPassword
    if (password) {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      if(request.body.newPassword) request.body.newPassword = hash;
      else request.body.password = hash
    }
    
    return next.handle().pipe(map(data => data));
  }
}