import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { InfoModule } from "./info/info.module";

@Module({
  imports: [
    AuthModule,
    InfoModule
  ],
})

export class CustomerModule {}