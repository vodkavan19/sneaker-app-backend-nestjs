import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProductSchema } from "../product/schema/product.schema";
import { ProductVersionSchema } from "../productVersion/schema/version.schema";
import { ImportSchema } from "./schema/import.schema";
import { ImportController } from "./import.controller";
import { ImportService } from "./import.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ProductVersion', schema: ProductVersionSchema }]),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: 'Import', schema: ImportSchema }]),
  ],
  controllers: [ImportController],
  providers: [ImportService]
})

export class ImportModule {}