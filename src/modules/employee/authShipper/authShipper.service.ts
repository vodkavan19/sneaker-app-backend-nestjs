import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Request, Response } from "express";
import mongoose from "mongoose";
import * as bcrypt from 'bcryptjs'

import { TokenService } from "src/modules/token/token.service";
import { Employee } from "../schema/employee.schema";
import { AuthDTO } from "../dto/auth.dto";

@Injectable() 
export class AuthShipperService {
  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
    @InjectModel(Employee.name) private employeeModel: mongoose.Model<Employee>
  ) {}

  async login(response: Response, authDTO: AuthDTO): Promise<Record<string, any>> {
    try {
      const employee = await this.employeeModel.findOne({ email: authDTO.email })
      if (!employee || employee.role != "role_4" ) throw new HttpException('Email hoặc mật khẩu không đúng!', HttpStatus.UNAUTHORIZED)
      const validPass = await bcrypt.compare(authDTO.password, employee.password)
      if (!validPass) throw new HttpException('Email hoặc mật khẩu không đúng!', HttpStatus.UNAUTHORIZED)

      if (employee && validPass) {
        const tokens = await this.tokenService.generateAuthTokens({
          sub: employee._id, 
          email: employee.email 
        })
        response.cookie('shipper-refresh-token', tokens.refreshToken, {
          maxAge: 15 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
          path: '/',
          sameSite: "strict",
        })

        const { password, ...others } = employee.toObject();
        return { ...others, accessToken: tokens.accessToken }
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async logout(response: Response): Promise<Record<string, any>> {
    try {
      response.clearCookie('shipper-refresh-token', {path: '/'})
      return { 
        statusCode: 200, 
        message: "Đăng xuất thành công!" 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async refreshToken(request: Request): Promise<Record<string, any>> {
    const refreshToken = request.cookies['shipper-refresh-token']
    if (!refreshToken) {
      throw new HttpException("Phiên làm việc của bạn đã hết hạn!", HttpStatus.UNAUTHORIZED);
    }
    
    try {
      const secret = this.configService.get('JWT_REFRESH_KEY')
      const prevPayload = await this.tokenService.verifyToken(refreshToken, secret)     
      if(prevPayload != null) {
        const newAccessToken = await this.tokenService.generateAccessToken(prevPayload)        
        return { 
          statusCode: 200, 
          accessToken: newAccessToken
        }
      } else {
        throw new HttpException("Xác thực không hợp lệ!", HttpStatus.UNAUTHORIZED);
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}