    import type { Request, Response } from "express";
    import { prisma } from "../lib/prisma";
    import { uploadImage } from "../utils/fileUpload";
    import type { UploadedFile } from "express-fileupload";

    // 1. create a new food
    export const createFood = async (req : Request, res : Response) => {
        try {

            // 1. Find Restaurant Id From Parameter 
            const { restaurantId } = req.params;
            console.log(restaurantId);

            // 2. check if restaurant exists  
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

            // 3. fetch some requirement data from req.body 
            const {
                foodName,
                description,
                price,
                discountPrice
            } = req.body;

            // 4. Add validation step 
            if(!foodName || !description || !price || !discountPrice){
                return res.status(400).json({
                    message : "Please provide all the required fields",
                })
            }

            // 5. fetch Image from req.files
            if(!req.files || !req.files.image){
                return res.status(400).json({
                    message : "Please provide image",
                })
            }

            const image = req.files.image as UploadedFile;

            // 6. add validation step 
            if(!image){
                return res.status(400).json({
                    message : "Please provide image",
                })
            }

            // 7. upload image on cloudinary 
            const uploadResponse = await uploadImage("foods", image.tempFilePath);

            if("error" in uploadResponse){
                return res.status(400).json({
                    message : "Error uploading image",
                })
            }

            // 8. create food 
            const newFood = await prisma.food.create({
                data : {
                    foodName,
                    description,
                    price,
                    discountPrice,
                    imageUrl : uploadResponse.secure_url as string, 
                    restaurantId : restaurant.id
                }
            });

            return res.status(201).json({
                message : "Food created successfully",
                food : newFood
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
            const { foodName, description, price, discountPrice } = req.body || {};

            console.log("pass here - 01")

            if(!req.files?.image){
                return res.status(400).json({
                    message : "Please provide image",
                })
            }

            const image = req.files.image as UploadedFile;

            const food = await prisma.food.findFirst({
                where : {
                    id : Number(id)
                }
            })

            console.log("pass here - 02")

            if(!food) {
                return res.status(400).json({
                    message : "Food does not exist",
                })
            }

            const newFoodData: any = {}

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
                const imageUrl = await uploadImage("foods", image.tempFilePath);

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

    // 5. Get a food by id
    export const getFoodById = async (req : Request, res : Response) => {
        try {
            const { id } = req.params;

            if(!id) {
                return res.status(400).json({
                    message : "Please provide food id",
                })
            }

            const food = await prisma.food.findFirst({
                where:{
                    id : Number(id)
                }
            })

            if(!food){
                return res.status(404).json({
                    message : "Food does not exist",
                })
            }

            return res.status(200).json({
                message : "Food retrieved successfully",
                food
            });
        }
        catch (error) {
            return res.status(500).json({
                message  : "Internal Server Error",
            });
        }
    }

    // 6. Get a food by keyword 
    export const getFoodByKeyword = async (req : Request, res : Response) => {
        try {
            const {
                keyword = "",
                sort = "createdAt",
                order = "desc"
            } = req.query;

            const or = [];
            const q = String(keyword).trim();

            if(q){
                or.push({
                    foodName : {
                        contains : q
                    }
                })
            }

            const foods = await prisma.food.findMany({
                where : {
                    OR : or
                },
                orderBy : {
                    [Number(sort)] : order
                }
            })
            
            if(!foods){
                return res.status(400).json({
                    message : "No foods found",
                })
            }

            return res.status(200).json({
                message : "Foods retrieved successfully",
                foods
            });
        }
        catch (error) {
            return res.status(500).json({
                message  : "Internal Server Error",
            });
        }
    }