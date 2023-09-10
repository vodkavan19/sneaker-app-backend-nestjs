import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";

export class updateDTO {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  sex: string;

  @Type(() => Date)
  @IsNotEmpty()
  birthday: Date;
}