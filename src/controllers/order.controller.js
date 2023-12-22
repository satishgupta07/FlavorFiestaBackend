import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Joi from "joi";
import { Product } from "../models/product.model.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createOrder = asyncHandler(async (req, res, next) => {
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

  const exchangeRate = 0.014; // Replace with the current exchange rate

  const lineItems = items.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.name,
        images: [product.image],
      },
      unit_amount: Math.round(product.price * exchangeRate * 100), // Convert price to USD
    },
    quantity: product.quantity,
  }));

  // checkout api
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:5173/customer/orders",
    cancel_url: "http://localhost:5173/cart",
  });

  if (!session) {
    return next(new ApiError(400, session.error));
  }

  const order = new Order({
    customerId: req.user._id,
    items,
    totalAmount,
    phone,
    address,
  });

  if (session.id) {
    order.paymentStatus = true;
    order.paymentType = "Card";
    await order.save();
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { sessionId: session.id },
        "Order placed successfully"
      )
    );
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
    items: orderWithProductDetails.filter((item) => item !== null),
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
