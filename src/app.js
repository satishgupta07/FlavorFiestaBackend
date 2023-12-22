import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Socket is active to be connected')

  socket.on('changeStatus', (payload) => {
    console.log("What is payload", payload);
    io.emit('changeStatus', payload);
  })
});

app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

//routes import
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);

export { httpServer };
