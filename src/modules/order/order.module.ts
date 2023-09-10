import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { ProductSchema } from "../product/schema/product.schema";
import { ProductVersionSchema } from "../productVersion/schema/version.schema";
import { CartSchema } from "../cart/schema/cart.schema";
import { OrderSchema } from "./schema/order.schema";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { ReviewSchema } from "../review/schema/review.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: 'Review', schema: ReviewSchema }]),
    MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }]),
    MongooseModule.forFeature([{ name: 'ProductVersion', schema: ProductVersionSchema }]),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    CloudinaryModule,
  ],
  controllers: [OrderController],
  providers: [OrderService]
})

export class OrderModule {}