import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { Types } from "mongoose";

import { AuthGuard } from "src/guard/auth.guard";
import { CustomerAddress } from "./schema/address.schema";
import { CustomerAddressService } from "./address.service";
import { ChangeDefaultDTO, CreateAddressDTO, UpdateAddressDTO } from "./dto/address.dto";

@Controller("address")
export class CustomerAddressController {
  constructor(private addressService: CustomerAddressService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllByCustomer(@Query() queryParams: Record<string, any>): Promise<CustomerAddress[]> {
    return this.addressService.getAllByCustomer(queryParams)
  }

  @Post()
  @UseGuards(AuthGuard)
  async createNew(@Body() createDTO: CreateAddressDTO): Promise<Record<string, any>> {
    return this.addressService.createNew(createDTO)
  }

  @Put("default/:id")
  @UseGuards(AuthGuard)
  async changeDefault(
    @Param("id") addressId: Types.ObjectId,
    @Body() changeDefaultDTO: ChangeDefaultDTO
  ): Promise<Record<string, any>> {
    return this.addressService.changeDefault(addressId, changeDefaultDTO)
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  async updateById(
    @Param("id") addressId: Types.ObjectId,
    @Body() updateDTO: UpdateAddressDTO
  ): Promise<Record<string, any>> {
    return this.addressService.updateById(addressId, updateDTO)
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async deleteById(@Param("id") addressId: Types.ObjectId): Promise<Record<string, any>> {
    return this.addressService.deleteById(addressId)
  }
}