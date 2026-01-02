import { Router } from "express";

import {
    getCart,
    addItemInCart,
    updateQuantity,
    removeItemFromCart,
    clearCart
} from "../controllers/cart.controller";

import {
    authMiddleware
} from "../middleware/auth.middleware"

const cartRouter = Router();


// Doubt
cartRouter.get("/", authMiddleware, getCart);
cartRouter.post("/", authMiddleware, addItemInCart);
cartRouter.put("/:id", authMiddleware, updateQuantity);
cartRouter.delete("/:id", authMiddleware, removeItemFromCart);
cartRouter.delete("/", authMiddleware, clearCart);

export default cartRouter;