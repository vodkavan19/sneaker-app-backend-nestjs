import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { CustomerAddress } from "src/modules/addressCustomer/schema/address.schema";
import { Customer } from "src/modules/customer/schema/customer.schema";
import { Employee } from "src/modules/employee/schema/employee.schema";
import { Product } from "src/modules/product/schema/product.schema";
import { ProductVersion } from "src/modules/productVersion/schema/version.schema";

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' })
  customer: Customer;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CustomerAddress' })
  address: CustomerAddress;

  @Prop({ required: true })
  deliveryMethodId: number;

  @Prop({ required: true })
  deliveryMethod: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop([
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      version: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVersion' },
      size: { type: Number, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true, min: 0 },
      discount: { type: Number, required: true, min: 0, max: 100 },
    },
  ])
  products: Array<{
    [x: string]: any;
    _id: Product;
    version: ProductVersion;
    size: number;
    quantity: number;
    price: number,
    discount: number,
  }>;

  @Prop({ required: true })
  total: number;
  
  @Prop({ required: true })
  shippingFee: number;
  
  @Prop({ required: true })
  estimatedTime: number;

  @Prop({ required: true })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' })
  shipper: Employee;

  @Prop([
    {
      title: { type: String, required: true },
      time: { type: Date, required: true },
      caption: { type: String }
    }
  ])
  itinerary: Array<{
    title: string;
    time: Date;
    caption: string;
  }>;

  @Prop({ type: Object })
  successProof: { link: string; path: string };
}

export const OrderSchema = SchemaFactory.createForClass(Order);