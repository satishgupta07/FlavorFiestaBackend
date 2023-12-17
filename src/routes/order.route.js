import express from "express";
import auth from "../middlewares/auth.js";
import { changeOrderStatus, createOrder, getAllOrders, getOrdersById, getOrdersOfUser } from "../controllers/order.controller.js";
import admin from "../middlewares/admin.js";

const orderRouter = express.Router();

orderRouter.get("/", auth, getOrdersOfUser);
orderRouter.get("/all-orders", [auth, admin], getAllOrders);
orderRouter.post("/order/status", [auth, admin], changeOrderStatus);
orderRouter.get("/:orderId", auth, getOrdersById);
orderRouter.post("/place-order", auth, createOrder);

export default orderRouter;