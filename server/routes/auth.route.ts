import { Router } from "express";

import {
    signup,
    login,
    sendLinkByEmail,
    updatePassword
} from "../controllers/auth.controller";

import {
    createUserAddress,
    updateUserAddress,
    deleteUserAddress,
    getAllUserAddress
} from "../controllers/useraddress.controller"

import { authMiddleware } from "../middleware/auth.middleware";


const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/forgot-password", sendLinkByEmail);
authRouter.put("/update-password/:token", updatePassword);

authRouter.post("/user-address/:id", authMiddleware, createUserAddress);
authRouter.put("/user-address/:id", authMiddleware, updateUserAddress);
authRouter.delete("/user-address/:id", authMiddleware, deleteUserAddress);
authRouter.get("/user-address/:id", authMiddleware, getAllUserAddress);

export default authRouter;