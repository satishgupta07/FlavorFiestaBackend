import express from "express";
import auth from "../middlewares/auth.js";
import { createOrder, getOrdersById, getOrdersOfUser } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.get("/", auth, getOrdersOfUser);
orderRouter.get("/:orderId", auth, getOrdersById);
orderRouter.post("/place-order", auth, createOrder);

export default orderRouter;