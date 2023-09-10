import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CloudinaryModule } from "src/modules/cloudinary/cloudinary.module";
import { BrandSchema } from "./schema/brand.schema";
import { BrandController } from "./brand.controller";
import { BrandServices } from "./brand.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Brand', schema: BrandSchema }]),
    CloudinaryModule,
  ],
  controllers: [BrandController],
  providers: [BrandServices],
})

export class BrandModule {}