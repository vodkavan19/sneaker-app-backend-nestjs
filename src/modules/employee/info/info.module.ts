import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CloudinaryModule } from "src/modules/cloudinary/cloudinary.module";
import { RegionModule } from "src/modules/region/region.module";
import { EmployeeSchema } from "../schema/employee.schema";
import { InfoService } from "./info.service";
import { InfoController } from "./info.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Employee', schema: EmployeeSchema }]),
    CloudinaryModule,
    RegionModule
  ],
  controllers: [InfoController],
  providers: [InfoService]
})

export class InfoModule {}