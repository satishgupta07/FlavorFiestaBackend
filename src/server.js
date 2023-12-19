import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {httpServer} from './app.js'
dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    httpServer.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ - Server is listening on http://localhost:${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
