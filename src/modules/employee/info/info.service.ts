import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { CloudinaryService } from "src/modules/cloudinary/cloudinary.service";
import { RegionServices } from "src/modules/region/region.service";
import { Employee } from "../schema/employee.schema";
import { RegisterDTO, UpdateDTO } from "../dto/info.dto";


@Injectable()
export class InfoService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly regionService: RegionServices,
    @InjectModel(Employee.name) private employeeModel: mongoose.Model<Employee>
  ) {}

  async createNew(registerDTO: RegisterDTO, file: Express.Multer.File): Promise<Record<string, any>> {
    const { province, district, ward, addressDetail, ...rest } = registerDTO;
    const avatar = file
      ? await this.cloudinaryService.uploadSingleFile(file, 'sneakerapp/employee')
      : undefined
    
    try {
      const isExisted = await this.employeeModel.findOne({ email: registerDTO.email })
      if(isExisted) throw new HttpException('Email đã tồn tại trên hệ thống!', HttpStatus.CONFLICT)
      
      const provinceName = await this.regionService.getProvinceName(province)
      const districtName = await this.regionService.getDistrictName(province, district)
      const wardName = await this.regionService.getWardName(district, ward)
      const fullAddress = `${addressDetail}, ${wardName}, ${districtName}, ${provinceName}`;
      
      await this.employeeModel.create({
        ...rest,
        avatar: avatar || {},
        address: {
          province: province,
          district: district,
          ward: ward,
          addressDetail: addressDetail,
          addressString: fullAddress,
        },
        status: true
      })

      return { 
        statusCode: 200, 
        message: "Thêm nhân viên thành công!" 
      }
    } catch (error) {
      if (avatar) this.cloudinaryService.deleteFile(avatar.path)
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async getAll(): Promise<Employee[]> {
    try {
      const employees = await this.employeeModel.find({ deletedAt: null });
      const result = employees.map((item) => {
        return { ...item.toObject(), ...item.address }
      }) 
      return result;
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getByRole(queryParam: Record<string, any>): Promise<Employee[]> {
    try {
      const employees = await this.employeeModel.find({
        role: queryParam.role,
        status: true
      })
      return employees
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getById(employeeId: Types.ObjectId): Promise<Employee> {
    try {
      const employee = await this.employeeModel.findById(employeeId)
      return { ...employee.toObject(), ...employee.address }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateById(employeeId: Types.ObjectId, updateDTO: UpdateDTO, file: Express.Multer.File): Promise<Record<string, any>> {
    const { province, district, ward, addressDetail, ...rest } = updateDTO;
    const avatar = file
      ? await this.cloudinaryService.uploadSingleFile(file, 'sneakerapp/employee')
      : undefined

    try {
      const isExisted = await this.employeeModel.findById(employeeId)
      if(avatar && isExisted.avatar) this.cloudinaryService.deleteFile(isExisted.avatar.path)

      const provinceName = await this.regionService.getProvinceName(province)
      const districtName = await this.regionService.getDistrictName(province, district)
      const wardName = await this.regionService.getWardName(district, ward)
      const fullAddress = `${addressDetail}, ${wardName}, ${districtName}, ${provinceName}`;

      await this.employeeModel.findByIdAndUpdate(employeeId, {
        ...rest,
        avatar: avatar || isExisted.avatar,
        address: {
          province: province,
          district: district,
          ward: ward,
          addressDetail: addressDetail,
          addressString: fullAddress,
        }
      })

      return { 
        statusCode: 200, 
        message: "Cập nhật thông tin nhân viên thành công!" 
      }
    } catch (error) {
      if (avatar) this.cloudinaryService.deleteFile(avatar.path)
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteById(employeeId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      await this.employeeModel.findByIdAndUpdate(employeeId, {
        deletedAt: new Date()
      })
      return { 
        statusCode: 200, 
        message: "Xóa nhân viên thành công!" 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  } 

  async toggleStatus(employeeId: Types.ObjectId): Promise<Record<string, any>> {
    try {
      const current = await this.employeeModel.findById(employeeId)
      const result = await this.employeeModel.findByIdAndUpdate(employeeId, {
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

  async updatePermission(employeeId: Types.ObjectId, permissions: Record<string, boolean>): Promise<Record<string, any>> {
    try {
      await this.employeeModel.findByIdAndUpdate(employeeId, {
        permissions: permissions
      })
      return { 
        statusCode: 200, 
        message: 'Cập nhật danh sách quyền thành công!' 
      }
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}