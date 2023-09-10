import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Employee } from "src/modules/employee/schema/employee.schema";
import { Product } from "src/modules/product/schema/product.schema";
import { ProductVersion } from "src/modules/productVersion/schema/version.schema";

export type ImportDocument = HydratedDocument<Import>;

@Schema({ timestamps: true })
export class Import {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  warehouse: string;

  @Prop({ required: true, trim: true })
  supplier: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' })
  employee: Employee;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop([
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      price: { type: Number, required: true },
      detail: [
        {
          version: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVersion' },
          size: { type: Number, required: true }, 
          quantity: { type: Number, required: true },
        }
      ]
    }
  ])
  products: Array<{
    product: Product;
    price: number;
    detail: Array<{
      version: ProductVersion;
      size: number;
      quantity: number;
    }>
  }>
}

export const ImportSchema = SchemaFactory.createForClass(Import);