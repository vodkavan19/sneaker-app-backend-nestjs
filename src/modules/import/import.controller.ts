import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Types } from "mongoose";

import { AuthGuard } from "src/guard/auth.guard";
import { Import } from "./schema/import.schema";
import { ImportService } from "./import.service";
import { createImportDTO } from "./dto/import.dto";

@Controller("import")
export class ImportController {
  constructor(private importServices: ImportService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createNew(@Body() createImportDTO: createImportDTO ): Promise<Record<string, any>> {
    return this.importServices.createNew(createImportDTO);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll(): Promise<Import[]> {
    return this.importServices.getAll()
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(@Param('id') importId: Types.ObjectId ): Promise<Import> {
    return this.importServices.getById(importId)
  }
}