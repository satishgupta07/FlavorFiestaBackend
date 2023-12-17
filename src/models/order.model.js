import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity can not be less then 1."],
            default: 1,
          },
        },
      ],
      default: [],
    },
    totalAmount : {type: Number, required: true},
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentType: { type: String, default: "COD" },
    paymentStatus: { type: Boolean, default: false },
    status: { type: String, default: "order_placed" },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
