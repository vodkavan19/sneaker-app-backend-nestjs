import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProductSchema } from "../product/schema/product.schema";
import { CustomerSchema } from "../customer/schema/customer.schema";
import { FavoriteController } from "./favorite.controller";
import { FavoriteService } from "./favorite.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }]),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})

export class FavoriteModule {}