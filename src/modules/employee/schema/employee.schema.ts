import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, maxlength: 50 })
  email: string;

  @Prop({ required: true, minlength: 8 })
  password: string;

  @Prop({ type: Object })
  avatar: { link: string; path: string };

  @Prop({ required: true, maxlength: 12 })
  phone: string;

  @Prop({ required: true })
  sex: string;

  @Prop({ required: true })
  birthday: Date;

  @Prop({ type: Object })
  address: {
    province: string,
    district: string,
    ward: string,
    addressDetail: string,
    addressString: string,
  };

  @Prop({ required: true })
  role: string;

  @Prop({ type: Object, default: {} })
  permissions: Record<string, string>;

  @Prop({ required: true })
  status: boolean;

  @Prop()
  deletedAt: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);