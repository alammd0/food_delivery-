import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { uploadImage } from "../utils/fileUpload";

// 1. create a new food
export const createFood = async (req : Request, res : Response) => {
    try {
        const { foodName, description, price, discountPrice } = req.body;

        const image = req.file;

        if(!foodName || !price){
            return res.status(400).json({
                message : "Food name and price are required",
            })
        }

        const restaurantId = req.body.restaurantId;

        if(!restaurantId){
            return res.status(400).json({
                message : "Please provide restaurant id",
            })
        }

        const restaurant = await prisma.restaurant.findFirst({
            where : {
                id : Number(restaurantId)
            }
        })

        if(!restaurant){
            return res.status(400).json({
                message : "Restaurant does not exist",
            })
        }

        // check if User exits in the database
        const userId = restaurant.userId;

        const user = await prisma.user.findFirst({
            where : {
                id : userId
            }
        })

        if(!user){
            return res.status(400).json({
                message : "User does not exist",
            })
        }
    
        if(!image){
            return res.status(400).json({
                message : "Please provide image",
            })
        }

        const imageUrl = await uploadImage("foods", image.path);

        if("error" in imageUrl){
            return res.status(400).json({
                message : "Error uploading image",
            })
        }


        const food = await prisma.food.create({
            data : {
                foodName,
                description,
                price,
                discountPrice,
                imageUrl : imageUrl.secure_url as string,
                restaurantId : restaurant.id
            }
        })

        // update restaurant's food
        await prisma.restaurant.update({
            where : {
                id : restaurant.id
            },
            data : {
                food : {
                    connect : {
                        id : food.id
                    }
                }
            }
        })

        return res.status(201).json({
            message : "Food created successfully",
            food
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 2. Update a food
export const updateFood = async (req : Request, res : Response) => {
    try {
        const { id } = req.params;
        const { foodName, description, price, discountPrice } = req.body;

        const image = req.file;

        const food = await prisma.food.findFirst({
            where : {
                id : Number(id)
            }
        })

        if(!food) {
            return res.status(400).json({
                message : "Food does not exist",
            })
        }

        const newFoodData = {
            foodName : food.foodName,
            description : food.description,
            price : food.price,
            discountPrice : food.discountPrice,
            imageUrl : food.imageUrl
        }

        if(foodName){
            newFoodData.foodName = foodName
        }

        if(description){
            newFoodData.description = description
        }

        if(price){
            newFoodData.price = price
        }


        if(discountPrice){
            newFoodData.discountPrice = discountPrice
        }

        if(image){
            const imageUrl = await uploadImage("foods", image.path);

            if("error" in imageUrl){
                return res.status(400).json({
                    message : "Error uploading image",
                })
            }
            newFoodData.imageUrl = imageUrl.secure_url as string
        }

        const updatedFood = await prisma.food.update({
            where : {
                id : Number(id)
            },
            data : newFoodData
        })

        return res.status(200).json({
            message : "Food updated successfully",
            food : updatedFood
        });

    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 3. Delete a food
export const deleteFood = async (req : Request, res : Response) => {
    try {
        const { id } = req.params ;

        if(!id){
            return res.status(400).json({
                message : "Please provide food id",
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

        await prisma.food.delete({
            where : {
                id : Number(id)
            }
        })

        // update restaurant's food
        await prisma.restaurant.update({
            where : {
                id : food.restaurantId
            },
            data : {
                food : {
                    disconnect : {
                        id : food.id
                    }
                }
            }
        })

        return res.status(200).json({
            message : "Food deleted successfully",
        });

    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 4. Get all foods
export const getAllFoods = async (req : Request, res : Response) => {
    try {
        const allFoods = await prisma.food.findMany({
            select : {
                id : true,
                foodName : true,
                description : true,
                price : true,
                discountPrice : true,
                imageUrl : true,
                createdAt : true,
                restaurant : {
                    select : {
                        restaurantName : true,
                        about : true,
                        phoneNo : true,
                        imageUrl : true,
                        createdAt : true,
                        user : {
                            select : {
                                name : true,
                            }
                        }
                    }
                }
            }, 
            orderBy : {
                createdAt : "desc"      
            }
        })

        if(!allFoods){
            return res.status(400).json({
                message : "No foods found",
            })
        }

        return res.status(200).json({
            message : "Foods retrieved successfully",
            foods : allFoods
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 5. Get a food by id // TODO 
export const getFoodById = async (req : Request, res : Response) => {
    try {

    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 6. Get a food by keyword // TODO
export const getFoodByKeyword = async (req : Request, res : Response) => {
    try {

    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}