import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { MailerService } from "@nestjs-modules/mailer";
import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import * as bcrypt from 'bcryptjs'

import { TokenService } from "src/modules/token/token.service";
import { Employee } from "../schema/employee.schema";

import { mailResetPasswordTemplate } from "src/utils/mail.util";
import { AuthDTO, ChangePasswordDTO, ForgotPassDTO, ResetPassDTO } from "../dto/auth.dto";

@Injectable({})
export class AuthService {
  constructor(
    private configService: ConfigService,
    private mailerService: MailerService,
    private tokenService: TokenService,
    @InjectModel(Employee.name) private employeeModel: mongoose.Model<Employee>
  ) {}

  async login(response: Response, authDTO: AuthDTO): Promise<Record<string, any>> {
    try {
      const employee = await this.employeeModel.findOne({ email: authDTO.email })
      if (!employee) throw new HttpException('Email hoặc mật khẩu không đúng!', HttpStatus.UNAUTHORIZED)
      const validPass = await bcrypt.compare(authDTO.password, employee.password)
      if (!validPass) throw new HttpException('Email hoặc mật khẩu không đúng!', HttpStatus.UNAUTHORIZED)

      if (employee && validPass) {
        const tokens = await this.tokenService.generateAuthTokens({
          sub: employee._id, 
          email: employee.email 
        })
        response.cookie('employee-refresh-token', tokens.refreshToken, {
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
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async logout(response: Response): Promise<Record<string, any>> {
    try {
      response.clearCookie('employee-refresh-token', {path: '/'})
      return { 
        statusCode: 200, 
        message: "Đăng xuất thành công!" 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async refreshToken(request: Request): Promise<Record<string, any>> {
    const refreshToken = request.cookies['employee-refresh-token']
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
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async sendMailVerify(forgotPassDTO: ForgotPassDTO): Promise<Record<string, any>> {
    try {
      const isExisted = await this.employeeModel.findOne(forgotPassDTO)
      if(!isExisted) {
        throw new HttpException('Không tìm thấy tài khoản!', HttpStatus.NOT_FOUND)
      }

      const token = await this.tokenService.generateVerifyMailToken(
        { sub: isExisted._id, email: isExisted.email }, 
        this.configService.get('JWT_MAIL_SECRET_KEY') + isExisted.password
      )
      const contentMail = mailResetPasswordTemplate(
        `${this.configService.get('URL_FRONTEND_SERVER')}/admin/reset_password/${isExisted._id}/${token}`
      )
      await this.mailerService.sendMail({
        to: isExisted.email,
        subject: "Xác minh nhân viên quên mật khẩu!",
        html: contentMail
      })

      return { 
        statusCode: 200, 
        message: "Gửi mail xác minh tài khoản thành công!" 
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async verifyMailToken(employeeId: Types.ObjectId, token: string): Promise<Record<string, any>> {
    try {
      const isExisted = await this.employeeModel.findById(employeeId)
      if(!isExisted) {
        throw new HttpException('Không tìm thấy tài khoản!', HttpStatus.NOT_FOUND)
      }

      const secret = this.configService.get('JWT_MAIL_SECRET_KEY') + isExisted.password
      const payload = await this.tokenService.verifyToken(token, secret)
      if(payload != null) {
        return { 
          statusCode: 200, 
          message: "Xác minh tài khoản thành công!" 
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Xác minh tài khoản thất bại', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async resetPassword(employeeId: Types.ObjectId, resetPassDTO: ResetPassDTO): Promise<Record<string, any>> {
    try {
      await this.employeeModel.findByIdAndUpdate(employeeId, {
        password: resetPassDTO.newPassword,
      })
      return { 
        statusCode: 200, 
        message: 'Cập nhật mật khẩu thành công!' 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async changePassword(employeeId: Types.ObjectId, data: ChangePasswordDTO): Promise<Record<string, any>> {
    try {
      const employee = await this.employeeModel.findById(employeeId)
      const valid = await bcrypt.compare(data.currentPassword, employee.password)
      if(!valid) throw new HttpException('Nhập sai mật khẩu hiện tại!', HttpStatus.UNAUTHORIZED);
      
      await this.employeeModel.findByIdAndUpdate(employeeId, {
        password: data.newPassword,
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