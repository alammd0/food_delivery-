import { Router } from "express";

import {
    createFood,
    updateFood,
    deleteFood,
    getAllFoods,
    getFoodById,
    getFoodByKeyword
} from "../controllers/food.controller";


import {
    createFoodRatingAndReview,
    updateFoodRatingAndReview,
    deleteFoodRatingAndReview,
    getAllFoodRatingAndReview
} from "../controllers/foodrating.controller";


import {
    authMiddleware,
    isOwner
} from "../middleware/auth.middleware"

const foodRouter = Router();

// Only for Is Owner
foodRouter.post("/", authMiddleware, isOwner, createFood);
foodRouter.put("/:id", authMiddleware, isOwner, updateFood);
foodRouter.delete("/:id", authMiddleware, isOwner, deleteFood);

// Any one Can Access
foodRouter.get("/", authMiddleware, getAllFoods);
foodRouter.get("/:id", authMiddleware, getFoodById);
foodRouter.get("/keyword/:keyword", authMiddleware, getFoodByKeyword);

foodRouter.post("/rating/:id", authMiddleware, createFoodRatingAndReview);
foodRouter.put("/rating/:id", authMiddleware, updateFoodRatingAndReview);
foodRouter.delete("/rating/:id", authMiddleware, deleteFoodRatingAndReview);
foodRouter.get("/rating/:id", authMiddleware, getAllFoodRatingAndReview);

export default foodRouter;