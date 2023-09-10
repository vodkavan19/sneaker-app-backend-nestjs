import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthDTO, ChangePasswordDTO, ForgotPassDTO, ResetPassDTO } from "../dto/auth.dto";
import { Request, Response } from "express";
import { Types } from "mongoose";

import { AuthGuard } from "src/guard/auth.guard";
import { HashPasswordInterceptor } from "src/interceptors/hashPassword.interceptor";
import { AuthService } from "./auth.service";

@Controller("employee")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login") 
  async login(
    @Body() authDTO: AuthDTO,
    @Res({ passthrough: true }) response: Response, 
  ): Promise<Record<string, any>> {
    return this.authService.login(response, authDTO);
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) response: Response): Promise<Record<string, any>> {
    return this.authService.logout(response)
  }

  @Post("refresh")
  async refreshToken(@Req() request: Request): Promise<Record<string, any>> {
    return this.authService.refreshToken(request)
  }

  @Post("forgot-password")
  async sendMailVerify(@Body() forgotPassDTO: ForgotPassDTO): Promise<Record<string, any>> {
    return this.authService.sendMailVerify(forgotPassDTO)
  }

  @Get("reset-password/:id/:token")
  async verifyMailToken(
    @Param('id') employeeId: Types.ObjectId,
    @Param('token') token: string,
  ): Promise<Record<string, any>> {
    return this.authService.verifyMailToken(employeeId, token)
  }

  @Post('reset-password/:id')
  @UseInterceptors(HashPasswordInterceptor)
  async resetPassword(
    @Param('id') employeeId: Types.ObjectId,
    @Body() resetPassDTO: ResetPassDTO
  ): Promise<Record<string, any>> {
    return this.authService.resetPassword(employeeId, resetPassDTO)
  }

  @Put('change-password/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(HashPasswordInterceptor)
  async changePassword(
    @Param('id') employeeId: Types.ObjectId,
    @Body() changePasswordDTO: ChangePasswordDTO,
  ): Promise<Record<string, any>> {
    return this.authService.changePassword(employeeId, changePasswordDTO)
  }
}