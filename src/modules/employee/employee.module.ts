import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { InfoModule } from "./info/info.module";
import { AuthShipperModule } from "./authShipper/authShipper.module";

@Module({
  imports: [
    AuthModule, 
    AuthShipperModule,
    InfoModule
  ],
})

export class EmployeeModule {}