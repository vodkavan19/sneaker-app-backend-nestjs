import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { RegionServices } from "./region.service";
import { RegionController } from "./region.controller";

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 10,
    })
  ],
  controllers: [RegionController],
  providers: [RegionServices],
  exports: [RegionServices]
})

export class RegionModule {}