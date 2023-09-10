import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeader(request)
    if (!accessToken) {
      throw new HttpException("Xác thực không hợp lệ!", HttpStatus.FORBIDDEN);
    }

    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>('JWT_ACCESS_KEY')
      })
      
    } catch (error) {
      throw new HttpException("Phiên làm việc đã hết hạn!", HttpStatus.FORBIDDEN)
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, accessToken] = request.headers.authorization 
      ? request.headers.authorization.split(' ') 
      : []
    return type === 'Bearer' ? accessToken : undefined;
  }
}