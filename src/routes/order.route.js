import express from "express";
import auth from "../middlewares/auth.js";
import { createOrder, getOrdersOfUser } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.get("/", auth, getOrdersOfUser);
orderRouter.post("/place-order", auth, createOrder);

export default orderRouter;