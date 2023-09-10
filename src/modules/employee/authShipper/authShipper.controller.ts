import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { AuthShipperService } from "./authShipper.service";
import { AuthDTO } from "../dto/auth.dto";
import { Request, Response } from "express";

@Controller("employee") 
export class AuthShipperController {
  constructor(private authShipperService: AuthShipperService) {}

  @Post("shipper-login")
  async login(
    @Body() authDTO: AuthDTO,
    @Res({ passthrough: true }) response: Response, 
  ): Promise<Record<string, any>> {
    return this.authShipperService.login(response, authDTO);
  }

  @Post("shipper-logout")
  async logout(@Res({ passthrough: true }) response: Response): Promise<Record<string, any>> {
    return this.authShipperService.logout(response)
  }

  @Post("shipper-refresh")
  async refreshToken(@Req() request: Request): Promise<Record<string, any>> {
    return this.authShipperService.refreshToken(request)
  }
}