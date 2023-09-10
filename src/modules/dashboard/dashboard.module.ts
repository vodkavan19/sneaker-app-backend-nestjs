import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProductSchema } from "../product/schema/product.schema";
import { OrderSchema } from "../order/schema/order.schema";
import { CustomerSchema } from "../customer/schema/customer.schema";
import { ImportSchema } from "../import/schema/import.schema";
import { EmployeeSchema } from "../employee/schema/employee.schema";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }]),
    MongooseModule.forFeature([{ name: 'Import', schema: ImportSchema }]),
    MongooseModule.forFeature([{ name: 'Employee' , schema: EmployeeSchema }]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService]
})

export class DashboardModule {}