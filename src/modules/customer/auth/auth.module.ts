import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { TokenModule } from "src/modules/token/token.module";
import { CustomerSchema } from "../schema/customer.schema";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }]),
    TokenModule
  ],
  controllers: [AuthController],
  providers: [AuthService]
})

export class AuthModule {}