import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Customer } from "src/modules/customer/schema/customer.schema";

export type CustomerAddressDocument = HydratedDocument<CustomerAddress>;

@Schema({ timestamps: true })
export class CustomerAddress {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' })
  customer: Customer;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, minlength: 9, maxlength: 12 })
  phone: string;

  @Prop({ required: true })
  province: number;

  @Prop({ required: true })
  district: number;

  @Prop({ required: true })
  ward: string;

  @Prop({ required: true })
  addressDetail: string;

  @Prop({ required: true })
  addressString: string;

  @Prop({ required: true })
  isPrimary: boolean
  
  @Prop()
  deletedAt: Date;
}

export const CustomerAddressSchema = SchemaFactory.createForClass(CustomerAddress);