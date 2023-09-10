import { Controller, Get, Param } from "@nestjs/common";
import { RegionServices } from "./region.service";

@Controller("region")
export class RegionController {
  constructor(private regionService: RegionServices) {}

  @Get("province") 
  async getProvinces(): Promise<Record<string, any>[]> {
    return this.regionService.fetchProvincesAPI();
  }

  @Get("district/:provinceId")
  async getDistricts(@Param('provinceId') provinceId: string): Promise<Record<string, any>[]> {
    return this.regionService.fetchDistrictsAPI(provinceId);
  }

  @Get("/ward/:districtId")
  async getWards(@Param('districtId') districtId: string): Promise<Record<string, any>[]> {
    return this.regionService.fetchWardsAPI(districtId);
  }

}