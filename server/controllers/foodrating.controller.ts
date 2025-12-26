import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// 1. Create a new food rating and review
export const createFoodRatingAndReview = async (req : Request, res : Response) => {
    try {

        // @ts-ignore
        const userId = req.user.id
        const { rating, review, foodId } = req.body;

        if(!rating || !review || !userId || !foodId){
            return res.status(400).json({
                message : "Please provide all the required fields",
            })
        }

        const user = await prisma.user.findFirst({
            where : {
                id : Number(userId)
            }
        })

        if(!user){
            return res.status(400).json({
                message : "User does not exist",
            })
        }

        const food = await prisma.food.findFirst({
            where : {
                id : Number(foodId)
            }
        })

        if(!food){
            return res.status(400).json({
                message : "Food does not exist",
            })
        }

        const foodRatingAndReview = await prisma.foodRatingAndReview.create({
            data : {
                rating : Number(rating),
                review : review,
                userId : userId,
                foodId : foodId
            }
        })

        await prisma.food.update({
            where : {
                id : foodId
            },

            data : {
                foodRating : {
                    connect : {
                        id : foodRatingAndReview.id
                    }
                }
            }
        })

        return res.status(201).json({
            message : "Thank for your review",
            foodRatingAndReview
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}


// 2. Update a food rating and review : H/w 
export const updateFoodRatingAndReview = async (req : Request, res : Response) => {
    try {

    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}


// 3. Delete a food rating and review
export const deleteFoodRatingAndReview = async (req : Request, res : Response) => {
    try {
        const { id } = req.params ; 

        if(!id){
            return res.status(400).json({
                message : "Please provide food rating and review id",
            })
        }

        const foodRatingAndReview = await prisma.foodRatingAndReview.findFirst({
            where : {
                id : Number(id)
            }
        })

        if(!foodRatingAndReview){
            return res.status(404).json({
                message : "Food rating and review does not exist",
            })
        }

        await prisma.foodRatingAndReview.delete({
            where : {
                id : Number(id)
            }
        })

        // update the food rating
        await prisma.food.update({
            where : {
                id : foodRatingAndReview.foodId
            },
            data : {
                foodRating : {
                    disconnect : {
                        id : foodRatingAndReview.id
                    }
                }
            }
        })

        return res.status(200).json({
            message : "Food rating and review deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}


// 4. Get all food rating and review
export const getAllFoodRatingAndReview = async (req : Request, res : Response) => {
    try {
        const allFoodRatingAndReview = await prisma.foodRatingAndReview.findMany({});

        if(!allFoodRatingAndReview){
            return res.status(400).json({
                message : "No food rating and review found",
            })
        }

        return res.status(200).json({
            message : "Food rating and review retrieved successfully",
            foodRatingAndReview : allFoodRatingAndReview
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}


// 5. get a food rating and review by id
export const getFoodRatingAndReviewById = async (req : Request, res : Response) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({
                message : "Please provide food rating and review id",
            })
        }

        const food = await prisma.food.findFirst({
            where : {
                id : Number(id)
            }
        })

        if(!food){
            return res.status(400).json({
                message : "Food does not exist",
            })
        }

        const foodRatingAndReview = await prisma.foodRatingAndReview.findFirst({
            where : {
                id : Number(food.id)
            }
        })

        if(!foodRatingAndReview){
            return res.status(400).json({
                message : "Food rating and review does not exist",
            })
        }

        return res.status(200).json({
            message : "Food rating and review retrieved successfully",
            foodRatingAndReview
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}