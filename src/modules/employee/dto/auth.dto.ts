import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class AuthDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class ForgotPassDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ResetPassDTO {
    @IsString()
    @IsNotEmpty()
    newPassword: string;
}

export class ChangePasswordDTO {
    @IsString()
    @IsNotEmpty()
    currentPassword: string;
  
    @IsString()
    @IsNotEmpty()
    newPassword: string;
}