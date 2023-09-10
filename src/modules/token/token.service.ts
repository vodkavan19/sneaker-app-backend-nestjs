import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async generateAuthTokens(payload: Record<string, any>): Promise<Record<string, string>> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload)
    ]);
    return { accessToken: accessToken, refreshToken: refreshToken }
  }

  async generateAccessToken(payload: Record<string, any>): Promise<string> {
    const token = await this.jwtService.signAsync(payload, { 
      secret: this.configService.get('JWT_ACCESS_KEY'), 
      expiresIn: '60s' 
    });
    return token;
  }

  async generateRefreshToken(payload: Record<string, any>): Promise<string> {
    const token = await this.jwtService.signAsync(payload, { 
      secret: this.configService.get('JWT_REFRESH_KEY'), 
      expiresIn: '15d'
    });
    return token;
  }

  async generateVerifyMailToken(payload: Record<string, any>, secret: string): Promise<string> {
    const token = await this.jwtService.signAsync(payload, { 
      secret: secret, 
      expiresIn: '15m' 
    });
    return token;
  }

  async verifyToken(token: string, secret: string): Promise<Record<string, any>> {
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: secret })
      const { iat, exp, ...rest } = payload
      return rest;
    } catch (error) {
      return null
    }
  }
}