import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { v2 as cloudinaryV2 } from "cloudinary";
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  constructor() {}

  private async uploadFile(file: Express.Multer.File, dest: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryV2.uploader.upload_stream(
        { folder: dest },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadSingleFile(file: Express.Multer.File, dest: string): Promise<Record<string, any>> {
    try {
      const result = await this.uploadFile(file, dest)
      return { link: result.secure_url, path: result.public_id }
    } catch (error) {
      throw new HttpException('Có lỗi xảy ra khi tải lên hình ảnh!', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async uploadArrayFiles(files: Express.Multer.File[], dest: string): Promise<Record<string, any>[]> {
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const result = await this.uploadFile(file, dest)
          return { link: result.secure_url, path: result.public_id }
        }
      ))
      return results;
    } catch (error) {
      throw new HttpException('Có lỗi xảy ra khi tải lên hình ảnh!', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async uploadArrayMixed(files: Express.Multer.File[], dest: string): Promise<Record<string, any>[]> {
    console.log(files);
    try {
      
      var indexFile = [], fileArr = [], results = []; 
      for (let i = 0; i < files.length; i++ ) {
        if(files[i] instanceof File) {
          fileArr.push(files[i])
          indexFile.push(i)
        } else {
          results.push(files[i])
        }
      }

      if(fileArr.length != 0) {
        const uploaded = await Promise.all(
          fileArr.map(async (file) => {
            const result = await this.uploadFile(file, dest)
            return { link: result.secure_url, path: result.public_id }
          }
        ))
        for (let i = 0; i < uploaded.length; i++ ) {
          results.splice(indexFile[i], 0, uploaded[i]);
        }
      }
      return results;
    } catch (error) {
      throw new HttpException('Có lỗi xảy ra khi tải lên hình ảnh!', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteFile(publicId: string) {
    await cloudinaryV2.uploader.destroy(publicId)
  }
}