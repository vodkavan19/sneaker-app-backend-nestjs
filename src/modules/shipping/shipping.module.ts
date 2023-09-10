import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { ShippingServices } from "./shipping.service";
import { ShippingController } from "./shipping.controller";

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 10,
    })
  ],
  controllers: [ShippingController],
  providers: [ShippingServices],
  exports: [ShippingServices]
})

export class ShippingModule {}