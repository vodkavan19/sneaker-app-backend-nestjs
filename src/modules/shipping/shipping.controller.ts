import { Body, Controller, Get, Post } from "@nestjs/common";
import { ShippingServices } from "./shipping.service";
import { ServicesDTO } from "./dto/shipping.dto";

@Controller("shipping")
export class ShippingController {
  constructor(private shippingService: ShippingServices) {}

  @Get("province")
  async getAllProvinces(): Promise<Record<string, any>[]> {
    return this.shippingService.fetchProvincesGHNAPI()
  }

  @Post("district")
  async getAllDistricts(@Body('province') province: number): Promise<Record<string, any>[]> {
    return this.shippingService.fetchDistrictsGHNAPI(province)
  }

  @Post("ward")
  async getAllWards(@Body('district') district: number): Promise<Record<string, any>[]> {
    return this.shippingService.fetchWardsGHNAPI(district)
  }

  @Post("service")
  async getServices(@Body() serviceDTO: ServicesDTO): Promise<Record<string, any>[]> {
    return this.shippingService.getServices(serviceDTO)
  }
}