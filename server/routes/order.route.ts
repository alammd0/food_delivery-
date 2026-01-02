import { Router } from "express";

import {
    createCheckOut,
    createOrder,
    verifyPayment,
    findOrderHistory,
    findPaymentHistory
} from "../controllers/order.controller"

import {
    authMiddleware
} from "../middleware/auth.middleware"

const orderRouter = Router();

orderRouter.post("/checkout", authMiddleware, createCheckOut);
orderRouter.post("/", authMiddleware, createOrder);
orderRouter.post("/payment/:id", authMiddleware, verifyPayment);
orderRouter.get("/history", authMiddleware, findOrderHistory);
orderRouter.get("/payment-history", authMiddleware, findPaymentHistory);

export default orderRouter;