import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { catchError, firstValueFrom } from "rxjs";

@Injectable()
export class RegionServices {
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  async fetchProvincesAPI(): Promise<Record<string, any>[]> { 
    const destAPI = this.configService.get<string>('REGION_API')
    const { data } = await firstValueFrom(
      this.httpService.get(`${destAPI}/province`).pipe(
        catchError(() => {
          throw new HttpException('Không tìm thấy kết quả!', HttpStatus.NOT_FOUND)
        })
      )
    )
    return data.results
  }

  async getProvinceName(provinceId: string): Promise<string> {
    const results = await this.fetchProvincesAPI();
    const province = results.find((item) => item.province_id == provinceId)
    return province.province_name;
  }

  async fetchDistrictsAPI(provinceId: string): Promise<Record<string, any>[]> {
    const destAPI = this.configService.get<string>('REGION_API')
    const { data } = await firstValueFrom(
      this.httpService.get(`${destAPI}/province/district/${provinceId}`).pipe(
        catchError(() => {
          throw new HttpException('Không tìm thấy kết quả!', HttpStatus.NOT_FOUND)
        })
      )
    )
    return data.results
  }

  async getDistrictName(provinceId: string, districtId: string): Promise<string> {
    const results = await this.fetchDistrictsAPI(provinceId);
    const district = results.find((item) => item.district_id == districtId)
    return district.district_name;
  }

  async fetchWardsAPI(districtId: string): Promise<Record<string, any>[]> {
    const destAPI = this.configService.get<string>('REGION_API')
    const { data } = await firstValueFrom(
      this.httpService.get(`${destAPI}/province/ward/${districtId}`).pipe(
        catchError(() => {
          throw new HttpException('Không tìm thấy kết quả!', HttpStatus.NOT_FOUND)
        })
      )
    )
    return data.results
  }

  async getWardName(districtId: string, wardId: string): Promise<string> {
    const results = await this.fetchWardsAPI(districtId);
    const ward = results.find((item) => item.ward_id == wardId)
    return ward.ward_name;
  }
}