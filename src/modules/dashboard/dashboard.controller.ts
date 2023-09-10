import { Body, Controller, Get, Post } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { BestSellerDTO, OrderByDateDTO } from "./dto/dashboard.dto";

@Controller("dashboard")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("product-count")
  async getCountProduct(): Promise<Record<string, any>> {
    return this.dashboardService.getCountProduct()
  }
  
  @Get("customer-count")
  async getCountCustomer(): Promise<Record<string, any>> {
    return this.dashboardService.getCountCustomer()
  }

  @Get("order-count")
  async getCountOrder(): Promise<Record<string, any>> {
    return this.dashboardService.getCountOrder()
  }

  @Get("product-by-brand")
  async countProductByBrand(): Promise<Record<string, any>[]> {
    return this.dashboardService.countProductByBrand()
  }

  @Get("statistic-import")
  async statisticImport(): Promise<Record<string, any>[]> {
    return this.dashboardService.statisticImport()
  }

  @Post("order-by-date")
  async countOrderByDate(@Body() bodyDTO: OrderByDateDTO): Promise<Record<string, any>[]> {
    return this.dashboardService.countOrderByDate(bodyDTO)
  }

  @Post("potential-customer")
  async potentialCustomer(): Promise<Record<string, any>[]> {
    return this.dashboardService.potentialCustomer()
  }

  @Post("bestseller")
  async bestSellerProduct(@Body() bodyDTO: BestSellerDTO): Promise<Record<string, any>[]> {
    return this.dashboardService.bestSellerProduct(bodyDTO)
  }

  @Get("employee-count")
  async countEmployee(): Promise<Record<string, any>[]> {
    return this.dashboardService.countEmployee()
  }
}