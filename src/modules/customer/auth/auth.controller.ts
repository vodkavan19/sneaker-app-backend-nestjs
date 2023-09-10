import { Body, Controller, Param, Post, Put, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { Request, Response } from "express";
import { Types } from "mongoose";

import { HashPasswordInterceptor } from "src/interceptors/hashPassword.interceptor";
import { AuthGuard } from "src/guard/auth.guard";
import { AuthService } from "./auth.service";
import { ChangePasswordDTO, LoginDTO, RegisterDTO } from "../dto/auth.dto";

@Controller("customer")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @UseInterceptors(HashPasswordInterceptor)
  async register(@Body() registerDTO: RegisterDTO): Promise<Record<string, any>> {
    return this.authService.register(registerDTO);
  }

  @Post("login")
  async login(
    @Body() loginDTO: LoginDTO,
    @Res({ passthrough: true }) response: Response, 
  ): Promise<Record<string, any>> {
    return this.authService.login(response, loginDTO)
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) response: Response): Promise<Record<string, any>> {
    return this.authService.logout(response)
  }

  @Post("refresh")
  async refreshToken(@Req() request: Request): Promise<Record<string, any>> {
    return this.authService.refreshToken(request)
  }

  @Put("change-password/:id")
  @UseGuards(AuthGuard)
  @UseInterceptors(HashPasswordInterceptor)
  async changePassword(
    @Param('id') customerId: Types.ObjectId,
    @Body() changePasswordDTO: ChangePasswordDTO
  ): Promise<Record<string, any>> {
    return this.authService.changePassword(customerId, changePasswordDTO)
  }
}