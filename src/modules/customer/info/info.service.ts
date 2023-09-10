import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { CloudinaryService } from "src/modules/cloudinary/cloudinary.service";
import { Customer } from "../schema/customer.schema";
import { updateDTO } from "../dto/info.dto";

@Injectable()
export class InfoService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Customer.name) private customerModel: mongoose.Model<Customer>
  ) {}

  async getAll(): Promise<Customer[]> {
    try {
      const employees = await this.customerModel.find();
      return employees;
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getById(customerId: Types.ObjectId): Promise<Customer> {
    try {
      const employee = await this.customerModel.findById(customerId)
      return employee
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateById(customerId: Types.ObjectId, updateDTO: updateDTO, file: Express.Multer.File): Promise<Record<string, any>> {
    const avatar = file
    ? await this.cloudinaryService.uploadSingleFile(file, 'sneakerapp/employee')
    : undefined

    try {
      const isExisted = await this.customerModel.findById(customerId)
      if(avatar && isExisted.avatar) this.cloudinaryService.deleteFile(isExisted.avatar.path)
      
      const result = await this.customerModel.findByIdAndUpdate(customerId, {
        ...updateDTO,
        avatar: avatar || isExisted.avatar,
      }, { new: true })
      return { 
        statusCode: 200, 
        data: result,
        message: "Cập nhật thông tin khách hàng thành công!" 
      }
    } catch (error) {
      if (avatar) this.cloudinaryService.deleteFile(avatar.path)
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  
  async toggleStatus(customerId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      const current = await this.customerModel.findById(customerId)
      const result = await this.customerModel.findByIdAndUpdate(customerId, {
        status: !current.status,
      }, { new: true })
      return { 
        statusCode: 200, 
        message: `${(result.status) ? "Mở khóa tài khoản" : "Khóa tài khoản"} thành công` 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}