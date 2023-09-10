import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ShippingModule } from "../shipping/shipping.module";
import { CustomerAddressSchema } from "./schema/address.schema";
import { CustomerAddressController } from "./address.controller";
import { CustomerAddressService } from "./address.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'CustomerAddress', schema: CustomerAddressSchema }]),
    ShippingModule
  ],
  controllers: [CustomerAddressController],
  providers: [CustomerAddressService],
})

export class CustomerAddressModule {}