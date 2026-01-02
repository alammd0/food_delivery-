import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// 1. Create a new user address 
export const createRestaurantAddress = async ( req: Request, res : Response) => {
    try {
        const { street, city, state, country, zipcode } = req.body;

        if(!street || !city || !state || !country || !zipcode) {
            return res.status(400).json({
                message  : "Please provide all the fields"
            })
        }

        const restaurant = await prisma.restaurant.findFirst({
            where : {
                id  :  Number(req.params.id)
            }
        })

        if(!restaurant) {
            return res.status(404).json({
                message  : "Restaurant Not Found"
            })
        }

        const restaurantAddress = await prisma.restaurantAddress.create({
            data : {
                street,
                city,
                state,
                country,
                zipcode,
                restaurantId : restaurant.id
            }
        });

        await prisma.restaurant.update({
            where : {
                id : restaurant.id
            },

            data : {
                address : {
                    connect : {
                        id : restaurantAddress.id
                    }
                }
            }
        })

        return res.status(201).json({
            message  : "Restaurant Address Created",
            restaurantAddress
        })
    }
    catch (error) {
        return res.status(500).json({
            message  : "Server Error"
        })
    }
}


// 2. update user address 
export const updateRestaurantAddress = async ( req: Request, res : Response) => {
    try{
        const { id } = req.params;

        const { street, city, state, country, zipcode } = req.body

        const restaurantAddress = await prisma.restaurantAddress.findFirst({
            where : {
                id : Number(id)
            }
        })


        if(!restaurantAddress){
            return res.status(404).json({
                message : "Restaurant Address Not Found"
            })
        }
        
        const newRestaurantAddressData = {
            street : restaurantAddress.street,
            city : restaurantAddress.city,
            state : restaurantAddress.state,
            country : restaurantAddress.country,
            zipcode : restaurantAddress.zipcode
        }
        
        if(street){
            newRestaurantAddressData.street = street
        }

        if(city){
            newRestaurantAddressData.city = city
        }

        if(state){
            newRestaurantAddressData.state = state
        }

        if(country){
            newRestaurantAddressData.country = country
        }

        if(zipcode){
            newRestaurantAddressData.zipcode = zipcode
        }

        const updatedRestaurantAddress = await prisma.restaurantAddress.update({
            where : {
                id : Number(id)
            },
            data : newRestaurantAddressData
        })

        return res.status(200).json({
            message  : "Restaurant Address Updated",
            restaurantAddress : updatedRestaurantAddress
        })
    }
    catch (error) {
        return res.status(500).json({
            message  : "Server Error"
        })
    }
}


// 3. Delete user address 
export const deleteRestaurantAddress = async ( req: Request, res : Response) => {
    try{
        const { id } = req.params;

        const restaurantAddress = await prisma.restaurantAddress.findFirst({
            where : {
                id : Number(id)
            }
        })

        if(!restaurantAddress){
            return res.status(404).json({
                message : "Restaurant Address Not Found"
            })
        }

        await prisma.restaurantAddress.delete({
            where : {
                id : Number(id)
            }
        });

        await prisma.restaurant.update({
            where : {
                id : restaurantAddress.restaurantId
            },

            data :{
                address : {
                    disconnect : {
                        id : restaurantAddress.id
                    }
                }
            }
            
        })

        return res.status(200).json({
            message  : "Restaurant Address Deleted"
        })
    }
    catch (error) {
        return res.status(500).json({
            message  : "Server Error"
        })
    }
}


// 4. Get all user address 
export const getAllRestaurantAddress = async ( req: Request, res : Response) => {
    try {
        const restaurant = await prisma.restaurant.findFirst({
            where : {
                id : Number(req.params.id)
            }
        })

        if(!restaurant) {
            return res.status(404).json({
                message : "Restaurant Not Found"
            })
        }

        const restaurantAddress = await prisma.restaurantAddress.findMany({
            where : {
                id : restaurant.id
            }
        })

        if(!restaurantAddress){
            return res.status(404).json({
                message : "Restaurant Address Not Found"
            })
        }

        return res.status(200).json({
            message  : "Restaurant Address Retrieved",
            restaurantAddress
        })
    }
    catch (error) {
        return res.status(500).json({
            message  : "Server Error"
        })
    }
}