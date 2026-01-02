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


const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/forgot-password", sendLinkByEmail);
authRouter.put("/update-password/:token", updatePassword);

authRouter.post("/address/:id", createUserAddress);
authRouter.put("/address/:id", updateUserAddress);
authRouter.delete("/address/:id", deleteUserAddress);
authRouter.get("/address/:id", getAllUserAddress);

export default authRouter;