import { Router } from "express";
import {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getAllRestaurants,
    getRestaurantById,
    getRestaurantByKeyword
} from "../controllers/restaurant.controller";

import {
    createRestaurantAddress,
    updateRestaurantAddress,
    deleteRestaurantAddress,
    getAllRestaurantAddress
} from "../controllers/restaurantaddress.controller"

import {
    authMiddleware,
    isOwner
} from "../middleware/auth.middleware"


const restaurantRouter = Router();


// Only for Is Owner
restaurantRouter.post("/", authMiddleware, isOwner, createRestaurant);
restaurantRouter.put("/:id", authMiddleware, isOwner, updateRestaurant);
restaurantRouter.delete("/:id", authMiddleware, isOwner, deleteRestaurant);

// Only for Is Owner => Address 
restaurantRouter.post("/address/:id", authMiddleware, isOwner, createRestaurantAddress);
restaurantRouter.put("/address/:id", authMiddleware, isOwner, updateRestaurantAddress);
restaurantRouter.delete("/address/:id", authMiddleware, isOwner, deleteRestaurantAddress);


// any one Can Access the Address 
restaurantRouter.get("/address/:id", authMiddleware, getAllRestaurantAddress);


// Only for Is User 
restaurantRouter.get("/", getAllRestaurants);
restaurantRouter.get("/:id", authMiddleware, getRestaurantById);
restaurantRouter.get("/search/:keyword", authMiddleware, getRestaurantByKeyword);


export default restaurantRouter;