import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRouter from "./routes/auth.route";
import foodRouter from "./routes/food.route";
import restaurantRouter from "./routes/restaurant.route";
import cartRouter from "./routes/cart.route";
import orderRouter from "./routes/order.route";

const app = express();

app.use(express.json());
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));

app.use("/auth", authRouter);
app.use("/food", foodRouter);
app.use("/restaurant", restaurantRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});