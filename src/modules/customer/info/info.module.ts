import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CloudinaryModule } from "src/modules/cloudinary/cloudinary.module";
import { CustomerSchema } from "../schema/customer.schema";
import { InfoController } from "./info.controller";
import { InfoService } from "./info.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }]),
    CloudinaryModule,
  ],
  controllers: [InfoController],
  providers: [InfoService],
})

export class InfoModule {}