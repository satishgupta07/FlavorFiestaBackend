import express from "express";
import {
  addItemOrUpdateItemQuantity,
  clearCart,
  getUserCart,
  removeItemFromCart,
} from "../controllers/cart.contoller.js";
import auth from "../middlewares/auth.js";

const cartRouter = express.Router();

cartRouter.get("/", auth, getUserCart);
cartRouter.delete("/clear", auth, clearCart);
cartRouter.post("/item/:productId", auth, addItemOrUpdateItemQuantity);
cartRouter.delete("/item/:productId", auth, removeItemFromCart);

export default cartRouter;
