import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { ShippingServices } from "../shipping/shipping.service";
import { CustomerAddress } from "./schema/address.schema";
import { ChangeDefaultDTO, CreateAddressDTO, UpdateAddressDTO } from "./dto/address.dto";


@Injectable()
export class CustomerAddressService {
  constructor(
    private shippingService: ShippingServices,
    @InjectModel(CustomerAddress.name) private addressModel: mongoose.Model<CustomerAddress>
  ) {}

  async getAllByCustomer(queryParam: Record<string, any>): Promise<CustomerAddress[]> {
    try {
      const address = await this.addressModel.find({
        customer: queryParam.customer,
        deletedAt: null,
      })
      return address
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async createNew(data: CreateAddressDTO): Promise<Record<string, any>> {
    try {
      const [provinceName, districtName, wardName] = await Promise.all([
        this.shippingService.getProvinceName(data.province),
        this.shippingService.getDistrictName(data.province, data.district),
        this.shippingService.getWardName(data.district, data.ward)
      ])

      const existed = await this.addressModel.find({ customer: data.customer });
      await this.addressModel.create({
        ...data,
        isPrimary: existed.length == 0 ? true : false,
        addressString: `${data.addressDetail}, ${wardName}, ${districtName}, ${provinceName}` 
      })
    
      return { 
        statusCode: 200, 
        message: "Thêm địa chỉ mới thành công!" 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async changeDefault(addressId: Types.ObjectId, changeDefaultDTO: ChangeDefaultDTO): Promise<Record<string, any>> {
    try {
      await this.addressModel.findOneAndUpdate({
        customer: changeDefaultDTO.customer,
        isPrimary: true,
      }, { isPrimary: false }, { new: true })

      await this.addressModel.findByIdAndUpdate(addressId, { isPrimary: true }) 
      return { 
        statusCode: 200, 
        message: "Thiết lập địa chỉ mặc định thành công!" 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateById(addressId: Types.ObjectId, data: UpdateAddressDTO): Promise<Record<string, any>> {
    try {
      const [provinceName, districtName, wardName] = await Promise.all([
        this.shippingService.getProvinceName(data.province),
        this.shippingService.getDistrictName(data.province, data.district),
        this.shippingService.getWardName(data.district, data.ward)
      ])
      await this.addressModel.findByIdAndUpdate(addressId, {
        ...data,
        addressString: `${data.addressDetail}, ${wardName}, ${districtName}, ${provinceName}` 
      })
      return { 
        statusCode: 200, 
        message: "Cập nhật địa chỉ thành công!" 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  
  async deleteById(addressId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      const address = await this.addressModel.findById(addressId)
      if (address.isPrimary) {
        throw new HttpException('Không thể xóa địa chỉ mặc định', HttpStatus.CONFLICT)
      } 
      await this.addressModel.findByIdAndUpdate(addressId, {
        deletedAt: new Date()
      })
      return { 
        statusCode: 200, 
        message: "Xóa địa chỉ thành công!" 
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

}