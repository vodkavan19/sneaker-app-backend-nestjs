import { IsAlpha, IsArray, IsNotEmpty, IsString } from "class-validator";

export class ProductVersionDTO {
  @IsString()
  @IsNotEmpty()
  product: string;

  @IsString()
  @IsNotEmpty()
  name: string;

}

export class UpdateProductVersionDTO {
  @IsString()
  @IsNotEmpty()
  product: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  
  @IsArray()
  idxImgUpdate: Array<number>
}