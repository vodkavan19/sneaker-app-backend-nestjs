import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAddressDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNumber()
  @IsNotEmpty()
  province: number;

  @IsNumber()
  @IsNotEmpty()
  district: number;

  @IsString()
  @IsNotEmpty()
  ward: string;

  @IsString()
  @IsNotEmpty()
  addressDetail: string;

  @IsString()
  @IsNotEmpty()
  customer: string;
}

export class UpdateAddressDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNumber()
  @IsNotEmpty()
  province: number;

  @IsNumber()
  @IsNotEmpty()
  district: number;

  @IsString()
  @IsNotEmpty()
  ward: string;

  @IsString()
  @IsNotEmpty()
  addressDetail: string;
}

export class ChangeDefaultDTO {
  @IsString()
  @IsNotEmpty()
  customer: string;
}