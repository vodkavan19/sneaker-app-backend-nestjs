import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProductVersionSchema } from "../productVersion/schema/version.schema";
import { CartSchema } from "./schema/cart.schema";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ProductVersion', schema: ProductVersionSchema }]),
    MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }]),
  ],
  controllers: [CartController],
  providers: [CartService],
})

export class CartModule {}