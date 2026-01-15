import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';


// 1. Create a new user address 
export const createUserAddress = async ( req: Request, res : Response) => {
    try {

        const { id } = req.params;

        const { street, city, state, country, zipcode } = req.body

        if(!street || !city || !state || !country || !zipcode) {
            return res.status(400).json({
                message  : "Please provide all the fields"
            })
        }

        const user =  await prisma.user.findUnique({
            where : {
                id : Number(id)
            }
        })

        if(!user) {
            return res.status(404).json({
                message  : "User Not Found"
            })
        }

        const userAddress = await prisma.userAddress.create({
            data : {
                street,
                city,
                state,
                country,
                zipcode,
                userId : user.id
            }
        });

        await prisma.user.update({
            where : {
                id : user.id
            },

            data : {
                address : {
                    connect : {
                        id : userAddress.id
                    }
                }
            }
        })


        return res.status(201).json({
            message  : "User Address Created",
            userAddress
        })

    }
    catch (error) {
        return res.status(500).json({
            message  : "Server Error"
        })
    }
}

// 2. update user address 
export const updateUserAddress = async ( req: Request, res : Response) => {
    try {

        const { id } = req.params;

        const { street, city, state, country, zipcode } = req.body

        const userAddress = await prisma.userAddress.findFirst({
            where : {
                id : Number(id)
            }
        })


        if(!userAddress){
            return res.status(404).json({
                message : "User Address Not Found"
            })
        }

        const newUserAddressData = {
            street : userAddress.street,
            city : userAddress.city,
            state : userAddress.state,
            country : userAddress.country,
            zipcode : userAddress.zipcode
        }

        if(street){
            newUserAddressData.street = street
        }

        if(city){
            newUserAddressData.city = city
        }

        if(state){
            newUserAddressData.state = state
        }

        if(country){
            newUserAddressData.country = country
        }

        if(zipcode){
            newUserAddressData.zipcode = zipcode
        }

        const updatedUserAddress = await prisma.userAddress.update({
            where : {
                id : Number(id)
            },
            data : newUserAddressData
        })

        return res.status(200).json({
            message  : "User Address Updated",
            userAddress : updatedUserAddress
        })
    }
    catch (error) {
        return res.status(500).json({
            message  : "Server Error"
        })
    }
}

// 3. Delete user address 
export const deleteUserAddress = async ( req: Request, res : Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id

        const userAddress = await prisma.userAddress.findFirst({
            where : {
                id : Number(id),
                userId : userId
            }
        })

        if(!userAddress){
            return res.status(404).json({
                message : "User Address Not Found"
            })
        }

        await prisma.userAddress.delete({
            where : {
                id : Number(id)
            }
        })

        return res.status(200).json({
            message  : "User Address Deleted"
        })
    }
    catch (error) {
        return res.status(500).json({
            message  : "Server Error"
        })
    }
}

// 4. Get all user address 
export const getAllUserAddress = async ( req: Request, res : Response) => {
    try {
        const { id } = req.params;
        
        const user = await prisma.user.findFirst({
            where : {
                id : Number(id)
            },
            include : {
                address : true
            }
        })

        if(!user){
            return res.status(404).json({
                message : "User Not Found"
            })
        }

        return res.status(200).json({
            message  : "User Address Retrieved",
            address : user.address
        })
    }
    catch (error) {
        return res.status(500).json({
            message  : "Server Error"
        })
    }
}