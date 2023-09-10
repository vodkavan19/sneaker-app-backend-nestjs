import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { BrandSchema } from "../brand/schema/brand.schema";
import { CategorySchema } from "../category/schema/category.schema";
import { ProductSchema } from "./schema/product.schema";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Brand', schema: BrandSchema }]),
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})

export class ProductModule {}