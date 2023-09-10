import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TokenModule } from "src/modules/token/token.module";
import { EmployeeSchema } from "../schema/employee.schema";
import { AuthShipperController } from "./authShipper.controller";
import { AuthShipperService } from "./authShipper.service";

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([{ name: 'Employee', schema: EmployeeSchema }]),
  ],
  controllers: [AuthShipperController],
  providers: [AuthShipperService],
})

export class AuthShipperModule {}