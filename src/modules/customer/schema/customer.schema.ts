import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, maxlength: 50 })
  email: string;

  @Prop({ required: true, minlength: 8 })
  password: string;

  @Prop({ type: Object })
  avatar: { link: string; path: string };

  @Prop({ minlength: 9, maxlength: 12 })
  phone: string;

  @Prop()
  sex: string;

  @Prop()
  birthday: Date;

  @Prop({ required: true })
  status: boolean;

  @Prop([mongoose.Schema.Types.ObjectId])
  favorites: [];

  @Prop()
  deletedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);