import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response, Request } from "express";
import { MailerService } from "@nestjs-modules/mailer";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import * as bcrypt from 'bcryptjs'

import { TokenService } from "src/modules/token/token.service";
import { Customer } from "../schema/customer.schema";
import { ChangePasswordDTO, LoginDTO, RegisterDTO } from "../dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private mailerService: MailerService,
    private tokenService: TokenService,
    @InjectModel(Customer.name) private customerModel: mongoose.Model<Customer>,
  ) {}

  async register(registerDTO: RegisterDTO): Promise<Record<string, any>> {
    try {
      const isExisted = await this.customerModel.findOne({ email: registerDTO.email })
      if(isExisted) throw new HttpException('Email đã được sử dụng!', HttpStatus.CONFLICT)
      
      await this.customerModel.create({ ...registerDTO, status: true })
      return { 
        statusCode: 200, 
        message: "Đăng ký tài khoản thành công!" 
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  } 

  async login(response: Response, loginDTO: LoginDTO): Promise<Record<string, any>> {
    try {
      const customer = await this.customerModel.findOne({ email: loginDTO.email })
      if (!customer) throw new HttpException('Email hoặc mật khẩu không đúng!', HttpStatus.UNAUTHORIZED)
      const validPass = await bcrypt.compare(loginDTO.password, customer.password)
      if (!validPass) throw new HttpException('Email hoặc mật khẩu không đúng!', HttpStatus.UNAUTHORIZED)

      if (customer && validPass) {
        const tokens = await this.tokenService.generateAuthTokens({
          sub: customer._id, 
          email: customer.email 
        })
        response.cookie('customer-refresh-token', tokens.refreshToken, {
          maxAge: 15 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
          path: '/',
          sameSite: "strict",
        })

        const { password, ...others } = customer.toObject();
        return { ...others, accessToken: tokens.accessToken }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async logout(response: Response): Promise<Record<string, any>> {
    try {
      response.clearCookie('customer-refresh-token', {path: '/'})
      return { 
        statusCode: 200, 
        message: "Đăng xuất thành công!" 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async refreshToken(request: Request): Promise<Record<string, any>> {
    const refreshToken = request.cookies['customer-refresh-token']
    if (!refreshToken) {
      throw new HttpException("Phiên làm việc của bạn đã hết hạn!", HttpStatus.UNAUTHORIZED);
    }

    try {
      const secret = this.configService.get('JWT_REFRESH_KEY')
      const prevPayload = await this.tokenService.verifyToken( refreshToken, secret)      
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
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async changePassword(customerId: Types.ObjectId, dto: ChangePasswordDTO): Promise<Record<string, any>> {
    try {
      const customer = await this.customerModel.findById(customerId)
      const valid = await bcrypt.compare(dto.currentPassword, customer.password)
      if(!valid) throw new HttpException('Nhập sai mật khẩu hiện tại!', HttpStatus.UNAUTHORIZED);

      await this.customerModel.findByIdAndUpdate(customerId, {
        password: dto.newPassword,
      })
      return { 
        statusCode: 200, 
        message: 'Cập nhật mật khẩu thành công!' 
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }
}