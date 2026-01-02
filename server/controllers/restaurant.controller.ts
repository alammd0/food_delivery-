import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { uploadImage } from "../utils/fileUpload";

// 1. Create a new restaurant
export const createRestaurant = async (req : Request, res : Response) => {
    try {

        const { restaurantName, about, phoneNo } = req.body;

        if(!restaurantName || !about || !phoneNo){
            return res.status(400).json({
                message : "Please provide all the required fields",
            })
        }

        const userId = req.user.id

        // check if User exits in the database
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

        const image = req.file;

        if(!image){
            return res.status(400).json({
                message : "Please provide image",
            })
        }

        const uploadResponse = await uploadImage("restaurants", image.path);

        if("error" in uploadResponse){
            return res.status(400).json({
                message : "Error uploading image",
            })
        }

        const imageUrl = uploadResponse.secure_url as string;


        const restaurant = await prisma.restaurant.create({
            data : {
                restaurantName,
                about,
                phoneNo,
                imageUrl : imageUrl,
                userId : userId
            }
        })

        // update user's restaurant
        await prisma.user.update({
            where : {
                id : userId
            },
            data : {
                restaurants : {
                    connect : {
                        id : restaurant.id
                    }
                }
            }
        })

        return res.status(201).json({
            message : "Restaurant created successfully",
            restaurant
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 2. Update a restaurant
export const updateRestaurant = async (req : Request, res : Response) => {
    try {
        const { id } = req.params;
        const { restaurantName, about, phoneNo } = req.body;

        const image = req.file;

        const restaurant = await prisma.restaurant.findFirst({
            where : {
                id : Number(id)
            }
        })

        if(!restaurant) {
            return res.status(400).json({
                message : "Restaurant does not exist",
            })
        }

        const newRestaurantData = {
            restaurantName : restaurant.restaurantName,
            about : restaurant.about,
            phoneNo : restaurant.phoneNo,
            imageUrl : restaurant.imageUrl
        }

        if(restaurantName){
            newRestaurantData.restaurantName = restaurantName
        }

        if(about){
            newRestaurantData.about = about
        }

        if(phoneNo){
            newRestaurantData.phoneNo = phoneNo
        }

        if(image){
            const imageUrl = await uploadImage("restaurants", image.path);

            if("error" in imageUrl){
                return res.status(400).json({
                    message : "Error uploading image",
                })
            }
            newRestaurantData.imageUrl = imageUrl.secure_url as string
        }

        const updatedRestaurant = await prisma.restaurant.update({
            where : {
                id : Number(id)
            }, 
            data : newRestaurantData
        })

        return res.status(200).json({
            message : "Restaurant updated successfully",
            restaurant : updatedRestaurant
        });

    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 3. Delete a restaurant
export const deleteRestaurant = async (req : Request, res : Response) => {
    try {
        const { id } = req.params;
        
        if(!id){
            return res.status(400).json({
                message : "Please provide restaurant id",
            })
        }

        const restaurant = await prisma.restaurant.findFirst({
            where : {
                id : Number(id)
            }
        })

        if(!restaurant){
            return res.status(400).json({
                message : "Restaurant does not exist",
            })
        }

        await prisma.restaurant.delete({
            where : {
                id : Number(id)
            }
        })

        // update user's restaurant
        await prisma.user.update({
            where : {
                id : restaurant.userId
            },
            data : {
                restaurants : {
                    disconnect : {
                        id : restaurant.id
                    }
                }
            }
        })

        return res.status(200).json({
            message : "Restaurant deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 4. Get all restaurants
export const getAllRestaurants = async (req : Request, res : Response) => {
    try {
        const allRestaurants = await prisma.restaurant.findMany({
            select : {
                id : true,
                restaurantName : true,
                about : true,
                phoneNo : true,
                imageUrl : true,
                createdAt : true,
                user : {
                    select : {
                        name : true,
                    }
                },

                restaurantRatingAndReview : {
                    select : {
                        rating : true,
                        review : true,
                        user : {
                            select : {
                                name : true,
                            }
                        }
                    }
                }
            },
        })

        if(!allRestaurants){
            return res.status(400).json({
                message : "No restaurants found",
            })
        }

        return res.status(200).json({
            message : "Restaurants retrieved successfully",
            restaurants : allRestaurants
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 5. Get a restaurant by id
export const getRestaurantById = async (req : Request, res : Response) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({
                message : "Please provide restaurant id",
            })
        }

        const restaurant = await prisma.restaurant.findFirst({
            where : {
                id : Number(id)
            },
            include : {
                user : {
                    select : {
                        name : true,
                    }
                },
                restaurantRatingAndReview : {
                    select : {
                        rating : true,
                        review : true,
                        user : {
                            select : {
                                name : true,
                            }
                        }
                    }
                }
            }
        })

        if(!restaurant){
            return res.status(400).json({
                message : "Restaurant does not exist",
            })
        }

        return res.status(200).json({
            message : "Restaurant retrieved successfully",
            restaurant
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}

// 6. Get a restaurant by keyword
export const getRestaurantByKeyword = async (req : Request, res : Response) => {
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
                restaurantName : {
                    contains : q
                }
            })
        }

        const restaurants = await prisma.restaurant.findMany({
            where : {
                OR : or
            },
            include : {
                user : {
                    select : {
                        name : true,
                    }
                },
                restaurantRatingAndReview : {
                    select : {
                        rating : true,
                        review : true,
                        user : {
                            select : {
                                name : true,
                            }
                        }
                    }
                }
            },
            orderBy : {
                [Number(sort)] : order
            }
        })

        if(!restaurants){
            return res.status(400).json({
                message : "No restaurants found",
            })
        }

        return res.status(200).json({
            message : "Restaurants retrieved successfully",
            restaurants
        });
    }
    catch (error) {
        return res.status(500).json({
            message  : "Internal Server Error",
        });
    }
}