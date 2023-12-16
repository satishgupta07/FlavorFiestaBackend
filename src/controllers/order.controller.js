import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Joi from "joi";

const createOrder = asyncHandler(async (req, res, next) => {
  const { items, phone, address } = req.body;

  const orderSchema = Joi.object({
    items: Joi.array().items().default([]),
    phone: Joi.string().min(10).required(),
    address: Joi.string().required(),
  });

  const { error } = orderSchema.validate(req.body);
  if (error) {
    return next(new ApiError(400, error));
  }

  const order = new Order({
    customerId: req.user._id,
    items,
    phone,
    address,
  });

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order placed successfully"));
});

export const getOrdersOfUser = async (req, res) => {
  const orders = await Order.find({ customerId: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
};

export { createOrder };
