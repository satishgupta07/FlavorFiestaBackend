import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Joi from "joi";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";

const createOrder = asyncHandler(async (req, res, next) => {
  const { items, totalAmount, phone, address } = req.body;

  const orderSchema = Joi.object({
    items: Joi.array().items().default([]),
    totalAmount: Joi.number().required(),
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
    totalAmount,
    phone,
    address,
  });

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order placed successfully"));
});

export const getOrdersOfUser = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customerId: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

export const getOrdersById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById({ _id: orderId });

  if (!order) {
    return new ApiError(404, "Order not found");
  }

  const orderWithProductDetails = await Promise.all(
    order.items.map(async (item) => {
      const product = await Product.findById(item.productId);

      if (!product) {
        // Handle the case where a product is not found
        return null;
      }

      // Add product details to the item
      return {
        ...item.toObject(),
        ...product.toObject(),
      };
    })
  );

  // Update the order with the items containing product details
  const orderWithDetails = {
    ...order.toObject(),
    items: orderWithProductDetails.filter((item) => item !== null)
  };

  return res
    .status(200)
    .json(new ApiResponse(200, orderWithDetails, "Order fetched successfully"));
});

export const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({});
    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders fetched successfully"));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal Server Error"));
  }
});

export const changeOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, newStatus } = req.body;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return new ApiError(404, "Order not found");
    }

    // Update the order status
    order.status = newStatus;

    // Save the updated order
    await order.save();

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order status updated successfully"));
  } catch (error) {
    console.error("Error fetching order:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, error, "Internal Server Error"));
  }
});

export { createOrder };
