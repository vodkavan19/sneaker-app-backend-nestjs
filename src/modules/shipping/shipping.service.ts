import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import { ServicesDTO } from "./dto/shipping.dto";

@Injectable()
export class ShippingServices {
  private regionAPI: string;
  private serviceAPI: string;
  private apiToken: string;
  private shopId: number;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.regionAPI = this.configService.get<string>('GHN_REGION_API')
    this.serviceAPI = this.configService.get<string>('GHN_SERVICE_API')
    this.apiToken = this.configService.get<string>('GHN_TOKEN')
    this.shopId = parseInt(this.configService.get<string>('GHN_SHOP_ID'))
  }

  async fetchProvincesGHNAPI(): Promise<Record<string, any>[]> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.regionAPI}/province`, {
        headers: { token: this.apiToken } 
      }).pipe(
        catchError(() => {
          throw new HttpException('Không tìm thấy kết quả!', HttpStatus.NOT_FOUND)
        })
      )
    )
    return data.data;
  } 

  async getProvinceName(provinceId: number): Promise<string> {
    const provinces = await this.fetchProvincesGHNAPI()
    const province = provinces.find((item: Record<string, any>) => item.ProvinceID == provinceId)    
    return province.ProvinceName;
  }

  async fetchDistrictsGHNAPI(provinceId: number): Promise<Record<string, any>[]> {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.regionAPI}/district`, { 
        province_id: provinceId 
      }, {
        headers: { token: this.apiToken } 
      }).pipe(
        catchError(() => {
          throw new HttpException('Không tìm thấy kết quả!', HttpStatus.NOT_FOUND)
        })
      )
    )
    return data.data
  }

  async getDistrictName(provinceId: number, districtId: number): Promise<string> {
    const districts = await this.fetchDistrictsGHNAPI(provinceId)
    const district = districts.find((item: Record<string, any>) => item.DistrictID == districtId)
    return district.DistrictName;
  }

  async fetchWardsGHNAPI(districtId: number): Promise<Record<string, any>[]> {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.regionAPI}/ward`, {
        district_id: districtId
      }, {
        headers: { token: this.apiToken } 
      }).pipe(
        catchError(() => {
          throw new HttpException('Không tìm thấy kết quả!', HttpStatus.NOT_FOUND)
        })
      )
    )
    return data.data;
  }

  async getWardName(districtId: number, wardId: string): Promise<string> {
    const wards = await this.fetchWardsGHNAPI(districtId)
    const ward = wards.find((item: Record<string, any>) => item.WardCode == wardId)
    return ward.WardName;
  }

  async getServices(data: ServicesDTO): Promise<Record<string, any>[]> {
    var results = [];
    const services = await this.fetchServiceGHNAPI(data.fromDistrict, data.toDistrict)
    for (const item of services) {    
      const [fee, time] = await Promise.all([
        this.fetchShippingFeeGHNAPI(
          item.service_id, data.toDistrict, data.toWard, data.weight
        ),
        this.fetchShipingTimeGHNAPI(
          item.service_id, data.fromDistrict, data.fromWard, data.toDistrict, data.toWard
        )
      ])
      results.push({
        ...item,
        fee: fee.total,
        time: time.leadtime * 1000
      })
    }
    return results;
  }

  private async fetchServiceGHNAPI(fromDistrict: number, toDistrict: number): Promise<Record<string, any>[]> {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.serviceAPI}/available-services`, {
        shop_id: this.shopId,
        from_district: fromDistrict,
        to_district: toDistrict
      }, {
        headers: { token: this.apiToken } 
      })
      .pipe(
        catchError(() => {
          throw new HttpException('Không tìm thấy kết quả!', HttpStatus.NOT_FOUND)
        })
      )
    ) 
    return data.data;
  }

  private async fetchShippingFeeGHNAPI(
    servicesId: number ,toDistrict: number, toWard: string, weight: number
  ): Promise<Record<string, any>> {    
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.serviceAPI}/fee`, {
          service_id: servicesId,
          to_district_id: toDistrict,
          to_ward_code: toWard,
          weight: weight,
        }, {
          headers: { Token: this.apiToken, ShopId: this.shopId } 
        })
      )
      return data.data
    } catch (error) {
      return { total: 30000 }; 
    }
  }

  private async fetchShipingTimeGHNAPI(
    servicesId: number ,fromDistrict: number, fromWard: string, toDistrict: number, toWard: string
  ): Promise<Record<string, any>> {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.serviceAPI}/leadtime`, {
        service_id: servicesId,
        from_district_id: fromDistrict,
        from_ward_code: fromWard,
        to_district_id: toDistrict,
        to_ward_code: toWard
      }, {
        headers: { Token: this.apiToken, ShopId: this.shopId } 
      })
      .pipe(
        catchError((err) => {
          throw new HttpException('Không tìm thấy kết quả!', HttpStatus.NOT_FOUND)
        })
      )
    ) 
    return data.data;
  }
}
