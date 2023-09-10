import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { TokenModule } from "src/modules/token/token.module";
import { EmployeeSchema } from "../schema/employee.schema";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([{ name: 'Employee', schema: EmployeeSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})

export class AuthModule {}