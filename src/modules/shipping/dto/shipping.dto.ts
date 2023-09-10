import { IsEmail, IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator"

export class ServicesDTO {
  @IsInt()
  @IsNotEmpty()
  fromDistrict: number;

  @IsString()
  @IsNotEmpty()
  fromWard: string;

  @IsInt()
  @IsNotEmpty()
  toDistrict: number;

  @IsString()
  @IsNotEmpty()
  toWard: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  weight: number;
}