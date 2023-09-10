import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Types } from "mongoose";

import { HashPasswordInterceptor } from "src/interceptors/hashPassword.interceptor";
import { AuthGuard } from "src/guard/auth.guard";
import { Employee } from "../schema/employee.schema";
import { RegisterDTO, UpdateDTO } from "../dto/info.dto";
import { InfoService } from "./info.service";

@Controller("employee")
export class InfoController {
  constructor(private infoService: InfoService) {}

  @Post("create")
  @UseGuards(AuthGuard)
  @UseInterceptors(HashPasswordInterceptor)
  @UseInterceptors(FileInterceptor('avatar'))
  async createNew(
    @Body() registerDTO: RegisterDTO,
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
    return this.infoService.createNew(registerDTO, file);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll(): Promise<Employee[]> {
    return this.infoService.getAll();
  }

  @Get('role')
  @UseGuards(AuthGuard)
  async getByRole(@Query() queryParams: Record<string, any>): Promise<Employee[]> {
    return this.infoService.getByRole(queryParams);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(@Param('id') employeeId: Types.ObjectId): Promise<Employee> {
    return this.infoService.getById(employeeId)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateById(
    @Param('id') employeeId: Types.ObjectId,
    @Body() updateDTO: UpdateDTO,
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
    return this.infoService.updateById(employeeId, updateDTO, file)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteById(@Param('id') employeeId: Types.ObjectId): Promise<Record<string, any>> {
    return this.infoService.deleteById(employeeId)
  }

  @Put('lock/:id')
  @UseGuards(AuthGuard)
  async toggleStatus(@Param('id') employeeId: Types.ObjectId): Promise<Record<string, any>> {
    return this.infoService.toggleStatus(employeeId)
  }

  @Put('permission/:id')
  @UseGuards(AuthGuard)
  async updatePermission(
    @Param('id') employeeId: Types.ObjectId, 
    @Body() permissions: Record<string, boolean>
  ): Promise<Record<string, any>> {
    return this.infoService.updatePermission(employeeId, permissions)
  }
}