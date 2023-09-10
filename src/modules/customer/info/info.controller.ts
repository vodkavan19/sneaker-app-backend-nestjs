import { Body, Controller, Get, HttpStatus, Param, ParseFilePipeBuilder, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";

import { AuthGuard } from "src/guard/auth.guard";
import { Customer } from "../schema/customer.schema";
import { InfoService } from "./info.service";
import { updateDTO } from "../dto/info.dto";

@Controller("customer")
export class InfoController {
  constructor(private infoService: InfoService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAll(): Promise<Customer[]> {
    return this.infoService.getAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(@Param('id') customerId: Types.ObjectId): Promise<Customer> {
    return this.infoService.getById(customerId)
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateById(
    @Param('id') customerId: Types.ObjectId,
    @Body() updateDTO: updateDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5000 * 1000 })
        .addFileTypeValidator({ fileType: /^image\/.*/ })
        .build({ 
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    ) file?: Express.Multer.File,
  ): Promise<Record<string, any>>
  {
    return this.infoService.updateById(customerId, updateDTO, file)
  }

  @Put('lock/:id')
  @UseGuards(AuthGuard)
  async toggleStatus(@Param('id') customerId: Types.ObjectId): Promise<Record<string, any>> {
    return this.infoService.toggleStatus(customerId)
  }
}