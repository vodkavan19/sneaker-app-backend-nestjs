import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { ProductSchema } from "../product/schema/product.schema";
import { ReviewSchema } from "./schema/review.schema";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: 'Review', schema: ReviewSchema }]),
    CloudinaryModule
  ],
  controllers: [ReviewController],
  providers: [ReviewService]
})

export class ReviewModule {}