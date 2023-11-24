import mongoose, { Schema } from "mongoose";

const menuSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
  },
  { timestamps: true }
);

export const Menu = mongoose.model("Menu", menuSchema);
