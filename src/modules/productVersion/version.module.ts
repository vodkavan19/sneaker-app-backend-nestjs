import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProductSchema } from "../product/schema/product.schema";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { ProductVersionSchema } from "./schema/version.schema";
import { ProductVersionController } from "./version.controller";
import { ProductVersionService } from "./version.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: 'ProductVersion', schema: ProductVersionSchema }]),
    CloudinaryModule
  ],
  controllers: [ProductVersionController],
  providers: [ProductVersionService],
})

export class ProductVersionModule {}